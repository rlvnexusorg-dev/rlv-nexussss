import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { submitContactEnquiry } from "../lib/contact.js";

const initialFields = { name: "", business: "", email: "", phone: "", service: "", budget: "", details: "", consent: false, website: "" };

export default function ContactForm() {
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const update = (event) => setFields({ ...fields, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await submitContactEnquiry(fields);
      setStatus({ type: "success", message: "Your enquiry was sent." });
      setFields(initialFields);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "The enquiry could not be sent. Please try again later." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="contact-panel" onSubmit={handleSubmit}>
      <h2>Tell us about your project</h2>
      <p>Share a few details. Fields marked * are required.</p>
      <div className="form-grid">
        <div className="form-field"><label htmlFor="name">Your name *</label><input id="name" name="name" autoComplete="name" required maxLength={100} value={fields.name} onChange={update} placeholder="Name" /></div>
        <div className="form-field"><label htmlFor="business">Business name</label><input id="business" name="business" autoComplete="organization" maxLength={120} value={fields.business} onChange={update} placeholder="Company or organization" /></div>
        <div className="form-field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={update} placeholder="you@example.com" /></div>
        <div className="form-field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={fields.phone} onChange={update} placeholder="Optional" /></div>
        <div className="form-field"><label htmlFor="service">Service required *</label><select id="service" name="service" required value={fields.service} onChange={update}><option value="" disabled>Select a service</option><option>Website design & development</option><option>Mobile app development</option><option>E-commerce development</option><option>Custom software development</option><option>Digital marketing</option><option>AI & business automation</option><option>Other / not sure yet</option></select></div>
        <div className="form-field"><label htmlFor="budget">Estimated budget</label><select id="budget" name="budget" value={fields.budget} onChange={update}><option value="">Prefer not to say</option><option>Under $2,500</option><option>$2,500–$10,000</option><option>$10,000–$25,000</option><option>$25,000+</option><option>To be discussed</option></select></div>
        <div className="form-field full"><label htmlFor="details">Project details *</label><textarea id="details" name="details" required minLength={10} maxLength={3000} value={fields.details} onChange={update} placeholder="What would you like to build, and what should it help you achieve?" /></div>
        <div className="form-field full"><label className="admin-checkbox"><input name="consent" type="checkbox" required checked={fields.consent} onChange={(event) => setFields({ ...fields, consent: event.target.checked })} />I agree that RLV NEXUS may use these details to respond to my enquiry. See the <Link to="/privacy-policy">privacy policy</Link>. *</label></div>
        <div className="form-field honeypot-field" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={update} /></div>
      </div>
      <p className="form-note">Your enquiry is sent securely for RLV NEXUS to respond. Please do not include passwords or sensitive personal information.</p>
      <button className="button-primary" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={15} /> Sending…</> : <>Send enquiry <ArrowRight size={15} /></>}</button>
      {status.message && <p className={`form-status ${status.type}`} role="status">{status.message}</p>}
    </form>
  );
}
