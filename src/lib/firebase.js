import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { appCheckConfigured, appCheckSiteKey, firebaseConfig, firebaseConfigured } from "./firebaseConfig.js";

export const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
if (app && appCheckSiteKey && typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export { appCheckConfigured };
