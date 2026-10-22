import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();
const MAX_PER_HOUR = 5;
const MAX_LENGTHS = { name: 100, business: 120, email: 254, phone: 40, service: 120, budget: 80, details: 3000 };

function cleanString(value, field, required = false) {
  if (typeof value !== "string") {
    if (required) throw new HttpsError("invalid-argument", `Enter a valid ${field}.`);
    return "";
  }

  const cleaned = value.trim();
  if (required && !cleaned) throw new HttpsError("invalid-argument", `Enter a valid ${field}.`);
  if (cleaned.length > MAX_LENGTHS[field]) throw new HttpsError("invalid-argument", `${field} is too long.`);
  return cleaned;
}

export const submitEnquiry = onCall(
  { enforceAppCheck: true, maxInstances: 10 },
  async (request) => {
    const data = request.data || {};
    if (typeof data.website === "string" && data.website.trim()) {
      throw new HttpsError("invalid-argument", "The enquiry could not be accepted.");
    }
    if (data.consent !== true) throw new HttpsError("invalid-argument", "Please accept the privacy notice.");

    const name = cleanString(data.name, "name", true);
    const business = cleanString(data.business, "business");
    const email = cleanString(data.email, "email", true).toLowerCase();
    const phone = cleanString(data.phone, "phone");
    const service = cleanString(data.service, "service", true);
    const budget = cleanString(data.budget, "budget");
    const details = cleanString(data.details, "details", true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError("invalid-argument", "Enter a valid email address.");
    }
    if (details.length < 10) {
      throw new HttpsError("invalid-argument", "Project details must be at least 10 characters.");
    }

    const ip = request.rawRequest.ip || request.rawRequest.socket?.remoteAddress || "unknown";
    const hour = new Date().toISOString().slice(0, 13);
    const key = createHash("sha256").update(`${hour}:${ip}`).digest("hex");
    const limiter = db.collection("rateLimits").doc(key);
    const submission = db.collection("enquiries").doc();
    const resetAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);

    await db.runTransaction(async (transaction) => {
      const previous = await transaction.get(limiter);
      const count = previous.exists ? Number(previous.data().count || 0) : 0;
      if (count >= MAX_PER_HOUR) {
        throw new HttpsError("resource-exhausted", "Too many enquiries were sent from this network. Try again later.");
      }

      transaction.set(limiter, { count: count + 1, resetAt });
      transaction.create(submission, {
        name,
        business,
        email,
        phone,
        service,
        budget,
        details,
        status: "New",
        internalNotes: "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { accepted: true };
  },
);
