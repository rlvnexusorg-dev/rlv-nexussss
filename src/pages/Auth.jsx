import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { AlertCircle, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { auth, db } from "../lib/firebase.js";
import { firebaseConfigured } from "../lib/firebaseConfig.js";
import { checkAdminAccess } from "../lib/contentAdmin.js";

function authMessage(error) {
  if (error?.code === "auth/email-already-in-use") return "An account already exists with this email. Sign in instead.";
  if (error?.code === "auth/invalid-credential" || error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password") return "Email or password is incorrect.";
  if (error?.code === "auth/weak-password") return "Choose a password with at least 6 characters.";
  if (error?.code === "auth/invalid-email") return "Enter a valid email address.";
  if (error?.code === "auth/too-many-requests") return "Too many attempts. Please wait a moment and try again.";
  if (error?.code === "auth/network-request-failed") return "Connection problem. Check your internet and try again.";
  return "Something went wrong. Please try again.";
}

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(searchParams.get("role") === "admin" ? "admin" : "user");
  const [registering, setRegistering] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, setCurrentUser);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadRole() {
      if (!currentUser || !db) {
        setCurrentRole("");
        return;
      }
      try {
        const profile = await getDoc(doc(db, "users", currentUser.uid));
        if (active) setCurrentRole(profile.data()?.role || (profile.data()?.admin === true ? "admin" : ""));
      } catch {
        if (active) setCurrentRole("");
      }
    }
    loadRole();
    return () => { active = false; };
  }, [currentUser]);

  function selectMode(nextMode) {
    setMode(nextMode);
    setSearchParams(nextMode === "admin" ? { role: "admin" } : {}, { replace: true });
    setRegistering(false);
    setError("");
    setNotice("");
  }

  async function saveUserProfile(user, name) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: "user",
      createdAt: serverTimestamp(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!auth || !db) return;
    setBusy(true);
    setError("");
    setNotice("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (registering) {
        const name = displayName.trim();
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(credential.user, { displayName: name });
        await saveUserProfile(credential.user, name);
        navigate("/account");
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      if (mode === "admin") {
        if (!await checkAdminAccess(credential.user)) {
          await signOut(auth);
          throw new Error("This account does not have admin access. Ask the Firebase project owner to approve it.");
        }
        navigate("/admin");
        return;
      }

      const profileRef = doc(db, "users", credential.user.uid);
      const profile = await getDoc(profileRef);
      if (!profile.exists()) {
        await saveUserProfile(credential.user, credential.user.displayName || "");
      } else if (profile.data().role !== "user") {
        await signOut(auth);
        throw new Error("This account has admin access. Choose Admin sign in to continue.");
      }
      navigate("/account");
    } catch (cause) {
      if (registering && auth.currentUser) {
        try {
          await signOut(auth);
        } catch {
          // Keep the original registration error visible.
        }
      }
      setError(cause.message && !cause.code ? cause.message : authMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    if (!auth || !email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setNotice("If an account exists for this email, a password reset link has been sent.");
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
    setCurrentRole("");
    setNotice("You have signed out.");
  }

  return (
    <>
      <SEO title="Sign in" description="Sign in or create an RLV NEXUS account." path="/login" noIndex />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link to="/">RLV NEXUS</Link><span>/</span><span>Account</span></div>
        <span className="eyebrow">Your RLV NEXUS account</span>
        <h1>Good work starts with <span className="gradient-text">a conversation.</span></h1>
        <p>Sign in to your account, or create one to stay connected with the team.</p>
      </div></section>
      <section className="content-section"><div className="container auth-layout">
        {!firebaseConfigured ? (
          <div className="empty-state auth-panel"><AlertCircle size={20} /><h2>Firebase is not connected</h2><p>Set up the Firebase web app settings before using account features.</p></div>
        ) : currentUser ? (
          <div className="contact-panel auth-panel">
            <span className="auth-icon"><UserRound size={19} /></span>
            <h2>You&apos;re signed in</h2>
            <p>{currentUser.email}{currentRole ? ` · ${currentRole}` : ""}</p>
            {currentRole !== "admin" && <Link className="button-primary" to="/account">Open your account</Link>}
            {currentRole === "admin" && <Link className="button-primary" to="/admin">Open admin</Link>}
            <button className="button-secondary auth-signout" type="button" onClick={handleSignOut}>Sign out</button>
          </div>
        ) : (
          <div className="contact-panel auth-panel">
            <div className="auth-role-switch" role="group" aria-label="Choose account type">
              <button className={mode === "user" ? "active" : ""} type="button" aria-pressed={mode === "user"} onClick={() => selectMode("user")}><UserRound size={15} /> User</button>
              <button className={mode === "admin" ? "active" : ""} type="button" aria-pressed={mode === "admin"} onClick={() => selectMode("admin")}><ShieldCheck size={15} /> Admin</button>
            </div>
            <span className="auth-icon"><LockKeyhole size={19} /></span>
            <h2>{mode === "admin" ? "Admin sign in" : registering ? "Create your account" : "Welcome back"}</h2>
            <p>{mode === "admin" ? "Use an account approved by the Firebase project owner." : registering ? "Your account is private and connected to your email." : "Sign in to your RLV NEXUS account."}</p>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {registering && <div className="form-field full"><label htmlFor="account-name">Name</label><input id="account-name" type="text" autoComplete="name" maxLength={100} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div>}
                <div className="form-field full"><label htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
                <div className="form-field full"><label htmlFor="account-password">Password</label><input id="account-password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
              </div>
              {error && <p className="form-status" role="alert">{error}</p>}
              {notice && <p className="form-status success" role="status">{notice}</p>}
              <button className="button-primary auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : registering ? "Create account" : "Sign in"}</button>
            </form>
            {mode === "user" ? (
              <div className="auth-links">
                <button type="button" onClick={handlePasswordReset} disabled={busy}>Forgot password?</button>
                <button type="button" onClick={() => { setRegistering(!registering); setError(""); setNotice(""); }}>{registering ? "Already have an account? Sign in" : "New here? Create an account"}</button>
              </div>
            ) : <p className="auth-admin-note">Admin accounts are created and approved by the project owner.</p>}
          </div>
        )}
      </div></section>
    </>
  );
}