import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { ArrowRight, CalendarClock, LogOut, PackageCheck, Send, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ContentStatus from "../components/ContentStatus.jsx";
import SEO from "../components/SEO.jsx";
import { services as defaultServices } from "../data/services.js";
import usePublicCollection from "../hooks/usePublicCollection.js";
import { auth, db } from "../lib/firebase.js";
import { firebaseConfigured } from "../lib/firebaseConfig.js";
import { safeExternalUrl } from "../lib/url.js";

function readableDate(value) {
  return value?.toDate?.().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) || "Just requested";
}

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");
  const [details, setDetails] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const liveServices = usePublicCollection("services", defaultServices);
  const serviceOptions = liveServices.data.length ? liveServices.data : defaultServices;

  useEffect(() => {
    if (!auth || !db) {
      setAuthLoading(false);
      return undefined;
    }
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profile = await getDoc(profileRef);
        const profileData = profile.data();
        if (profileData?.role === "admin" || profileData?.admin === true) {
          navigate("/admin", { replace: true });
          return;
        }
        if (!profile.exists()) {
          await setDoc(profileRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            role: "user",
            createdAt: serverTimestamp(),
          });
        }
        if (active) setUser(currentUser);
      } catch (cause) {
        console.error("Could not load the customer profile:", cause);
        if (active) setError("Your account could not be loaded. Check your Firebase connection and try again.");
      } finally {
        if (active) setAuthLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!user || !db) return undefined;
    setBookingsLoading(true);
    return onSnapshot(
      query(collection(db, "serviceBookings"), where("uid", "==", user.uid)),
      (snapshot) => {
        setBookings(snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id }))
          .sort((first, second) => (second.createdAt?.toMillis?.() || 0) - (first.createdAt?.toMillis?.() || 0)));
        setBookingsLoading(false);
        setError("");
      },
      (cause) => {
        console.error("Could not load service bookings:", cause);
        setBookingsLoading(false);
        setError("Your bookings could not be loaded. Check the Firestore rules and try again.");
      },
    );
  }, [user]);

  async function handleBooking(event) {
    event.preventDefault();
    const service = serviceOptions.find((item) => item.id === selectedService);
    if (!user || !db || !service) {
      setError("Choose a service and sign in before sending a request.");
      return;
    }
    if (referenceUrl.trim() && !safeExternalUrl(referenceUrl.trim())) {
      setError("Enter a valid HTTP or HTTPS reference URL.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await addDoc(collection(db, "serviceBookings"), {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        serviceId: service.id,
        serviceTitle: service.title,
        details: details.trim(),
        referenceUrl: referenceUrl.trim(),
        status: "Requested",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setDetails("");
      setReferenceUrl("");
      setNotice("Your request is in. The team will follow up to confirm the details.");
    } catch (cause) {
      console.error("Could not submit the service booking:", cause);
      if (cause.code === "permission-denied") {
        setError("Booking denied. Publish the latest Firestore rules and confirm your account role is user.");
      } else {
        setError(cause.message || "The booking could not be sent. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (auth) await signOut(auth);
    navigate("/", { replace: true });
  }

  return (
    <>
      <SEO title="My Account" description="Book RLV NEXUS services and follow your requests." path="/account" noIndex />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link to="/">RLV NEXUS</Link><span>/</span><span>My account</span></div>
        <span className="eyebrow">Customer account</span>
        <h1>Your projects, <span className="gradient-text">in motion.</span></h1>
        <p>Book a service, share what you have in mind, and keep an eye on your requests.</p>
      </div></section>
      <section className="content-section"><div className="container">
        {!firebaseConfigured ? <div className="empty-state"><h2>Firebase is not connected</h2><p>Connect the Firebase web app before booking services.</p></div> : authLoading ? <div className="empty-state" role="status">Loading your account…</div> : !user ? <div className="empty-state"><h2>Sign in to continue</h2><Link className="text-link" to="/login">Go to sign in <ArrowRight size={14} /></Link></div> : (
          <>
            <div className="account-toolbar"><div className="account-identity"><span className="auth-icon"><UserRound size={18} /></span><div><strong>{user.displayName || "Your account"}</strong><span>{user.email}</span></div></div><button className="button-secondary" type="button" onClick={handleSignOut}><LogOut size={14} /> Sign out</button></div>
            <ContentStatus status={liveServices.status} error={liveServices.error} />
            <div className="account-layout">
              <section className="contact-panel account-booking">
                <span className="eyebrow"><CalendarClock size={13} /> Service request</span>
                <h2>What can we help you build?</h2>
                <p>Tell us a little about the work. We&apos;ll get back to you to discuss scope and timing.</p>
                <form onSubmit={handleBooking}>
                  <div className="form-grid">
                    <div className="form-field full"><label htmlFor="booking-service">Service</label><select id="booking-service" required value={selectedService} onChange={(event) => setSelectedService(event.target.value)}><option value="" disabled>Select a service</option>{serviceOptions.map((service) => <option value={service.id} key={service.id}>{service.title}</option>)}</select></div>
                    <div className="form-field full"><label htmlFor="booking-details">What do you need?</label><textarea id="booking-details" required minLength={10} maxLength={3000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="A few details about your idea, goals, or current setup" /></div>
                    <div className="form-field full"><label htmlFor="booking-reference">Reference link (optional)</label><input id="booking-reference" type="url" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="https://" /></div>
                  </div>
                  {error && <p className="form-status" role="alert">{error}</p>}
                  {notice && <p className="form-status success" role="status">{notice}</p>}
                  <button className="button-primary account-submit" type="submit" disabled={busy || !serviceOptions.length}><Send size={14} /> {busy ? "Sending request…" : "Send service request"}</button>
                </form>
              </section>
              <section className="account-history" aria-labelledby="booking-history-title">
                <div className="account-section-heading"><div><span className="eyebrow"><PackageCheck size={13} /> Your activity</span><h2 id="booking-history-title">Service requests <span>{bookings.length}</span></h2></div></div>
                {bookingsLoading ? <p className="account-muted" role="status">Loading your requests…</p> : bookings.length === 0 ? <div className="empty-state"><p>No service requests yet. Your bookings will show up here.</p></div> : <div className="booking-list">{bookings.map((booking) => (
                  <article className="booking-row" key={booking.id}>
                    <div className="booking-row-heading"><h3>{booking.serviceTitle}</h3><span className={`booking-status status-${(booking.status || "Requested").toLowerCase().replaceAll(" ", "-")}`}>{booking.status || "Requested"}</span></div>
                    <p>{booking.details}</p>
                    <div className="booking-meta"><span>Sent {readableDate(booking.createdAt)}</span></div>
                    {safeExternalUrl(booking.referenceUrl) && <a className="text-link booking-attachment-link" href={booking.referenceUrl} target="_blank" rel="noreferrer">View reference <ArrowRight size={13} /></a>}
                  </article>
                ))}</div>}
              </section>
            </div>
          </>
        )}
      </div></section>
    </>
  );
}