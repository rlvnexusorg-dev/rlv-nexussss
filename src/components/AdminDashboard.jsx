import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ArrowRight, BriefcaseBusiness, CalendarClock, Inbox, Layers3, Users } from "lucide-react";
import { db } from "../lib/firebase.js";

const metrics = [
  ["projects", "Published projects", BriefcaseBusiness],
  ["clients", "Published clients", Users],
  ["services", "Published services", Layers3],
  ["enquiries", "Total enquiries", Inbox],
  ["serviceBookings", "Service bookings", CalendarClock],
];

export default function AdminDashboard({ onNavigate }) {
  const [counts, setCounts] = useState({ projects: 0, clients: 0, services: 0, enquiries: 0, serviceBookings: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) return undefined;
    const unsubscribers = [];
    let pending = metrics.length;
    for (const [key] of metrics) {
      const source = collection(db, key);
      const dataQuery = key === "enquiries" || key === "serviceBookings" ? source : query(source, where("published", "==", true));
      unsubscribers.push(onSnapshot(
        dataQuery,
        (snapshot) => {
          setCounts((current) => ({ ...current, [key]: snapshot.size }));
          if (key === "enquiries") {
            setRecent(snapshot.docs
              .map((item) => ({ ...item.data(), id: item.id }))
              .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
              .slice(0, 5));
          }
          pending -= 1;
          if (pending <= 0) setLoading(false);
        },
        (cause) => {
          console.error(`Could not load admin ${key} summary:`, cause);
          setError("Some dashboard data could not be loaded. Check admin permissions and Firebase rules.");
          setLoading(false);
        },
      ));
    }
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <section className="admin-dashboard">
      <div className="admin-list-heading"><h2>Dashboard overview</h2><span className="admin-muted">{loading ? "Loading live totals…" : "Live Firestore totals"}</span></div>
      {error && <p className="form-status" role="alert">{error}</p>}
      <div className="admin-metrics">
        {metrics.map(([id, label, Icon]) => <button className="admin-metric" type="button" key={id} onClick={() => onNavigate(id === "serviceBookings" ? "bookings" : id)}><span className="admin-metric-icon"><Icon size={18} /></span><strong>{loading ? "—" : counts[id]}</strong><span>{label}</span></button>)}
      </div>
      <div className="admin-list">
        <div className="admin-list-heading"><h2>Recent enquiries</h2><button className="text-link" type="button" onClick={() => onNavigate("enquiries")}>View all <ArrowRight size={14} /></button></div>
        {loading ? <p className="admin-muted">Loading recent enquiries…</p> : recent.length === 0 ? <p className="admin-muted">No enquiries yet. New contact form submissions will appear here.</p> : recent.map((item) => (
          <article className="admin-record" key={item.id}><div><strong>{item.name}</strong><span>{item.email} · {item.status || "New"} · {item.service}</span></div><span className="admin-muted">{item.createdAt?.toDate?.().toLocaleDateString() || "Just received"}</span></article>
        ))}
      </div>
    </section>
  );
}
