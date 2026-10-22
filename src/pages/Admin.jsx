import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AlertCircle, BriefcaseBusiness, CalendarClock, FileText, Inbox, Layers3, LogOut, MessageSquareQuote, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import AdminContentManager from "../components/AdminContentManager.jsx";
import { checkAdminAccess } from "../lib/contentAdmin.js";
import { auth } from "../lib/firebase.js";
import { firebaseConfigured } from "../lib/firebaseConfig.js";
import AdminDashboard from "../components/AdminDashboard.jsx";
import EnquiriesManager from "../components/EnquiriesManager.jsx";
import BookingsManager from "../components/BookingsManager.jsx";
import AdminAboutManager from "../components/AdminAboutManager.jsx";

const sections = [
  { id: "overview", label: "Overview", icon: Layers3 },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "clients", label: "Clients", icon: Users },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "about", label: "About & skills", icon: FileText },
  { id: "testimonials", label: "Reviews", icon: MessageSquareQuote },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "bookings", label: "Bookings", icon: CalendarClock },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAdmin(false);
      setAuthLoading(Boolean(currentUser));
      if (!currentUser) {
        setAuthLoading(false);
        return;
      }
      try {
        setIsAdmin(await checkAdminAccess(currentUser));
      } catch (cause) {
        console.error("Could not verify Firebase admin permissions:", cause);
        setFormError("Admin permission could not be verified. Check the Firestore rules and your admin profile.");
      } finally {
        setAuthLoading(false);
      }
    });
  }, []);

  async function handleSignOut() {
    if (!auth) return;
    try {
      await signOut(auth);
      setFormError("");
    } catch (cause) {
      console.error("Firebase admin sign-out failed:", cause);
      setFormError("Could not sign out. Please try again.");
    }
  }

  return (
    <>
      <SEO title="Content Admin" description="Secure RLV NEXUS content management." path="/admin" noIndex />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>RLV NEXUS</span><span>/</span><span>Admin</span></div>
        <span className="eyebrow">Firebase content manager</span>
        <h1>Manage your <span className="gradient-text">website content.</span></h1>
        <p>Add and update projects, client profiles, and approved reviews. Published changes sync to the public website automatically.</p>
      </div></section>
      <section className="content-section"><div className="container">
        {!firebaseConfigured ? (
          <div className="empty-state">
            <AlertCircle size={20} />
            <h2>Connect your Firebase project first</h2>
            <p>Add the Firebase web app settings to your local <code>.env.local</code> file and restart the dev server. Follow the Firebase setup guide in <code>README.md</code>.</p>
          </div>
        ) : authLoading ? (
          <div className="empty-state" role="status">Checking Firebase sign-in…</div>
        ) : !user ? (
          <div className="empty-state">
            <h2>Admin sign in</h2>
            <p>Sign in with an account created in Firebase Authentication and approved for admin access.</p>
            {formError && <p className="form-status" role="alert">{formError}</p>}
            <Link className="button-primary" to="/login?role=admin">Continue to admin sign in</Link>
          </div>
        ) : !isAdmin ? (
          <div className="empty-state">
            <AlertCircle size={20} />
            <h2>This account is not an admin</h2>
            <p>Ask the Firebase project owner to set <code>role: "admin"</code> in <code>users/{user.uid}</code>, then sign in again.</p>
            {formError && <p className="form-status" role="alert">{formError}</p>}
            <button className="button-secondary" type="button" onClick={handleSignOut}><LogOut size={14} /> Sign out</button>
          </div>
        ) : (
          <div className="admin-content">
            <div className="admin-toolbar">
              <span>Signed in as <strong>{user.email}</strong></span>
              <button className="button-secondary" type="button" onClick={handleSignOut}><LogOut size={14} /> Sign out</button>
            </div>
            <nav className="admin-tabs" aria-label="Manage content">
              {sections.map(({ id, label, icon: Icon }) => (
                <button className={`filter-button ${activeSection === id ? "active" : ""}`} type="button" aria-pressed={activeSection === id} onClick={() => setActiveSection(id)} key={id}><Icon size={14} /> {label}</button>
              ))}
            </nav>
            {activeSection === "overview" ? <AdminDashboard onNavigate={setActiveSection} /> : activeSection === "enquiries" ? <EnquiriesManager /> : activeSection === "bookings" ? <BookingsManager /> : activeSection === "about" ? <AdminAboutManager /> : <AdminContentManager key={activeSection} collectionName={activeSection} />}
          </div>
        )}
      </div></section>
    </>
  );
}
