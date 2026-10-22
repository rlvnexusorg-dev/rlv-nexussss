import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { listenToAdminCollection, removeContent, updateContent } from "../lib/contentAdmin.js";

const enquiryStatuses = ["New", "Contacted", "In Progress", "Won", "Closed"];

export default function EnquiriesManager() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => listenToAdminCollection(
    "enquiries",
    (records) => {
      setItems(records);
      setLoading(false);
    },
    (cause) => {
      console.error("Could not load private enquiries:", cause);
      setError("Enquiries could not be loaded. Check the authenticated admin role and Firestore rules.");
      setLoading(false);
    },
  ), []);

  const filtered = useMemo(() => items
    .filter((item) => statusFilter === "All" || (item.status || "New") === statusFilter)
    .filter((item) => `${item.name} ${item.business} ${item.email} ${item.service}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)), [items, statusFilter, search]);
  const current = items.find((item) => item.id === selected);

  async function change(id, patch) {
    setError("");
    try {
      await updateContent("enquiries", id, patch);
    } catch (cause) {
      console.error("Could not update enquiry:", cause);
      setError(cause.message || "Could not update this enquiry.");
    }
  }

  async function deleteEnquiry(item) {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    try {
      await removeContent("enquiries", item.id);
      if (selected === item.id) setSelected("");
    } catch (cause) {
      console.error("Could not delete enquiry:", cause);
      setError(cause.message || "Could not delete this enquiry.");
    }
  }

  return (
    <div className="enquiries-manager">
      <section className="admin-list">
        <div className="admin-list-heading"><h2>Contact enquiries <span>{items.length}</span></h2></div>
        <div className="enquiry-filters">
          <label className="enquiry-search"><Search size={15} /><input aria-label="Search enquiries" placeholder="Search name, email, service…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{enquiryStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        </div>
        {loading ? <p className="admin-muted">Loading private enquiries…</p> : filtered.length === 0 ? <p className="admin-muted">No enquiries match this filter.</p> : filtered.map((item) => (
          <article className={`admin-record enquiry-record ${selected === item.id ? "selected" : ""}`} key={item.id}>
            <button type="button" className="enquiry-select" onClick={() => setSelected(item.id)}><strong>{item.name}</strong><span>{item.email} · {item.service} · {item.status || "New"}</span></button>
            <div className="admin-record-actions"><select aria-label={`Status for ${item.name}`} value={item.status || "New"} onChange={(event) => change(item.id, { status: event.target.value })}>{enquiryStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className="icon-button danger" type="button" aria-label={`Delete enquiry from ${item.name}`} onClick={() => deleteEnquiry(item)}><Trash2 size={14} /></button></div>
          </article>
        ))}
      </section>
      <section className="contact-panel enquiry-detail">
        {!current ? <p className="admin-muted">Select an enquiry to review its details and add internal notes.</p> : <>
          <div className="admin-list-heading"><h2>{current.name}</h2><span className="admin-muted">{current.createdAt?.toDate?.().toLocaleString() || "Received"}</span></div>
          <dl><dt>Email</dt><dd><a href={`mailto:${current.email}`}>{current.email}</a></dd>{current.phone && <><dt>Phone</dt><dd>{current.phone}</dd></>}<dt>Business</dt><dd>{current.business || "Not provided"}</dd><dt>Service</dt><dd>{current.service}</dd><dt>Budget</dt><dd>{current.budget || "Not provided"}</dd><dt>Project details</dt><dd className="enquiry-details">{current.details}</dd></dl>
          <div className="form-field"><label htmlFor="enquiry-notes">Internal notes (private)</label><textarea id="enquiry-notes" key={current.id} defaultValue={current.internalNotes || ""} onBlur={(event) => { if (event.target.value !== (current.internalNotes || "")) change(current.id, { internalNotes: event.target.value }); }} placeholder="Only visible to admins" /></div>
        </>}
        {error && <p className="form-status" role="alert">{error}</p>}
      </section>
    </div>
  );
}
