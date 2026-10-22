import { useEffect, useState } from "react";
import { firebaseConfigured } from "../lib/firebaseConfig.js";

export default function usePublicCollection(collectionName, fallbackData = []) {
  const [data, setData] = useState(fallbackData);
  const [status, setStatus] = useState(firebaseConfigured ? "loading" : "demo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured) {
      setData(fallbackData);
      setStatus("demo");
      setError("");
      return undefined;
    }

    setStatus("loading");
    let active = true;
    let unsubscribe;

    async function subscribe() {
      try {
        const [{ db }, firestore] = await Promise.all([
          import("../lib/firebase.js"),
          import("firebase/firestore"),
        ]);
        if (!active || !db) return;

        const publicQuery = firestore.query(
          firestore.collection(db, collectionName),
          firestore.where("published", "==", true),
        );
        unsubscribe = firestore.onSnapshot(
          publicQuery,
          (snapshot) => {
            const records = snapshot.docs.map((item) => {
              const record = item.data();
              return {
                ...record,
                id: item.id,
                gallery: Array.isArray(record.gallery) ? record.gallery : [],
                technologies: Array.isArray(record.technologies)
                  ? record.technologies
                  : [],
                projectIds: Array.isArray(record.projectIds)
                  ? record.projectIds
                  : [],
              };
            });
            if (collectionName === "services") {
              records.sort((first, second) => (first.displayOrder || 0) - (second.displayOrder || 0));
            }
            setData(records);
            setError("");
            setStatus("ready");
          },
          (cause) => {
            console.error(`Could not load public ${collectionName}:`, cause);
            setData([]);
            setError("Live content could not be loaded. Please try again later.");
            setStatus("error");
          },
        );
      } catch (cause) {
        console.error(`Could not connect to public ${collectionName}:`, cause);
        if (active) {
          setData([]);
          setError("Live content could not be loaded. Please try again later.");
          setStatus("error");
        }
      }
    }

    subscribe();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [collectionName, fallbackData]);

  return { data, status, error, isFirebase: firebaseConfigured };
}
