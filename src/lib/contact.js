import { getFunctions, httpsCallable } from "firebase/functions";
import { appCheckConfigured, firebaseConfigured } from "./firebaseConfig.js";

export async function submitContactEnquiry(fields) {
  if (!firebaseConfigured) {
    throw new Error("The enquiry form is not connected yet. Please contact us using the details on this page.");
  }
  if (!appCheckConfigured) {
    throw new Error("Contact form protection is not configured yet. Please use the alternate contact details on this page.");
  }

  const { app, auth } = await import("./firebase.js");
  if (!auth) throw new Error("The secure contact service is unavailable.");

  const submit = httpsCallable(getFunctions(app, "us-central1"), "submitEnquiry");
  const result = await submit({
    ...fields,
    website: fields.website || "",
    consent: fields.consent === true,
  });

  if (result.data?.accepted !== true) {
    throw new Error("The enquiry could not be confirmed. Please try again.");
  }
}
