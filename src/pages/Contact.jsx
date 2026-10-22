import { MessageCircle, Mail, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm.jsx";
import SEO from "../components/SEO.jsx";
import { safeExternalUrl } from "../lib/url.js";

export default function Contact() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const whatsappUrl = whatsappNumber?.replace(/\D/g, "") ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "";
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE;

  return (
    <>
      <SEO title="Contact Us" description="Start a conversation with RLV NEXUS about your website, mobile app, software, design, or digital growth project." path="/contact" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>Contact</span></div>
        <span className="eyebrow">Let&apos;s talk</span>
        <h1>Have a challenge?<br /><span className="gradient-text">Let&apos;s find a way forward.</span></h1>
        <p>Tell us a little about what you&apos;re building. We&apos;ll use the details to understand where we might help.</p>
      </div></section>
      <section className="content-section"><div className="container contact-layout">
        <aside className="contact-panel">
          <h2>Start a conversation</h2>
          <p>Contact channels are configurable and remain hidden until genuine business details are provided.</p>
          <div className="value-card" style={{ marginTop: 20 }}><Mail className="value-icon" size={19} /><h3>Email</h3><p>{contactEmail || "Business email not configured yet."}</p>{contactEmail && <a className="text-link" href={`mailto:${contactEmail}`}>Email us</a>}</div>
          <div className="value-card" style={{ marginTop: 12 }}><Phone className="value-icon" size={19} /><h3>Phone</h3><p>{contactPhone || "Business phone not configured yet."}</p>{contactPhone && <a className="text-link" href={`tel:${contactPhone}`}>Call us</a>}</div>
          {whatsappUrl ? <a className="button-secondary" href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 18 }}><MessageCircle size={15} /> Chat on WhatsApp</a> : <p className="form-note" style={{ marginTop: 18 }}>WhatsApp is not configured. Set VITE_WHATSAPP_NUMBER to enable the contact button.</p>}
        </aside>
        <ContactForm />
      </div></section>
    </>
  );
}
