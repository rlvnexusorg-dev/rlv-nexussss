import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { listenToAdminCollection, updateContent } from "../lib/contentAdmin.js";

const bookingStatuses = ["Requested", "In Review", "Scheduled", "Completed", "Cancelled"];

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => listenToAdminCollection(
    "serviceBookings",
    (records) => {
      setBookings(records.sort((first, second) => (second.createdAt?.toMillis?.() || 0) - (first.createdAt?.toMillis?.() || 0)));
      setLoading(false);
    },
    (cause) => {
      console.error("Could not load service bookings:", cause);
      setError("Service bookings could not be loaded. Check your admin role and Firestore rules.");
      setLoading(false);
    },
  ), []);

  async function changeStatus(id, status) {
    setError("");
    try {
      await updateContent("serviceBookings", id, { status });
    } catch (cause) {
      console.error("Could not update booking status:", cause);
      setError(cause.code === "permission-denied"
        ? "Status update denied. Check the admin account and published Firestore rules."
        : "Booking status could not be updated. Please try again.");
    }
  }

  return (
    <section className="admin-list bookings-manager">
      <div className="admin-list-heading"><h2>Service bookings <span>{bookings.length}</span></h2><span className="admin-muted">Customer requests</span></div>
      {error && <p className="form-status" role="alert">{error}</p>}
      {loading ? <p className="admin-muted">Loading service bookings…</p> : bookings.length === 0 ? <p className="admin-muted">No service requests yet. New bookings from customer accounts will show here.</p> : bookings.map((booking) => (
        <article className="admin-record booking-admin-record" key={booking.id}>
          <div className="booking-admin-info"><strong><CalendarClock size={14} /> {booking.serviceTitle}</strong><span>{booking.name || "Customer"} · {booking.email} · {booking.createdAt?.toDate?.().toLocaleDateString() || "Just received"}</span><p>{booking.details}</p>{booking.referenceUrl && <a className="text-link" href={booking.referenceUrl} target="_blank" rel="noreferrer">Open reference</a>}</div>
          <div className="admin-record-actions"><select aria-label={`Status for booking from ${booking.email}`} value={booking.status || "Requested"} onChange={(event) => changeStatus(booking.id, event.target.value)}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
        </article>
      ))}
    </section>
  );
}