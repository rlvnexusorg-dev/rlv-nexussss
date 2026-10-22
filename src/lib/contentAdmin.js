import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

const collections = new Set(["projects", "clients", "services", "testimonials", "enquiries", "serviceBookings"]);

function assertCollection(collectionName) {
  if (!collections.has(collectionName)) {
    throw new Error("This content type cannot be managed here.");
  }
  if (!db) {
    throw new Error("Firebase is not configured. Add the Firebase settings before using the admin.");
  }
}

export async function checkAdminAccess(user) {
  if (!db || !user) return false;
  const profile = await getDoc(doc(db, "users", user.uid));
  if (!profile.exists()) return false;
  const data = profile.data();
  return data.admin === true || data.role === "admin";
}

export function listenToAdminCollection(collectionName, onData, onError) {
  assertCollection(collectionName);
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))),
    onError,
  );
}

export async function saveContent(collectionName, recordId, record) {
  assertCollection(collectionName);
  const payload = { ...record, updatedAt: serverTimestamp() };

  if (recordId) {
    await updateDoc(doc(db, collectionName, recordId), payload);
    return recordId;
  }

  const created = await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export async function removeContent(collectionName, recordId) {
  assertCollection(collectionName);
  await deleteDoc(doc(db, collectionName, recordId));
}

export async function updateContent(collectionName, recordId, patch) {
  assertCollection(collectionName);
  await updateDoc(doc(db, collectionName, recordId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
