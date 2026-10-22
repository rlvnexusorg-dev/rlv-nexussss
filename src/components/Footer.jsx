import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "./Navbar.jsx";
import { services } from "../data/services.js";
import { safeExternalUrl } from "../lib/url.js";
import usePublicCollection from "../hooks/usePublicCollection.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const liveServices = usePublicCollection("services", services);
  const visibleServices = liveServices.data.slice(0, 5);
  const socialLinks = [
    ["LinkedIn", import.meta.env.VITE_LINKEDIN_URL],
    ["Instagram", import.meta.env.VITE_INSTAGRAM_URL],
    ["Facebook", import.meta.env.VITE_FACEBOOK_URL],
  ].filter(([, url]) => safeExternalUrl(url));
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Brand />
            <p>We build digital experiences that grow businesses. Thoughtful strategy, modern technology, and a focus on what matters.</p>
          </div>
          <div className="footer-column">
            <h3>Services</h3>
            {visibleServices.map((service) => <Link to="/services" key={service.id}>{service.title}</Link>)}
            <Link to="/services">All services <ArrowUpRight size={11} /></Link>
          </div>
          <div className="footer-column">
            <h3>Company</h3>
            <Link to="/about">About us</Link>
            <Link to="/clients">Our clients</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/admin">Content admin</Link>
          </div>
          <div className="footer-column">
            <h3>Get in touch</h3>
            <Link to="/contact">Contact RLV NEXUS</Link>
            {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : <span>Email: add business email</span>}
            {contactPhone ? <a href={`tel:${contactPhone}`}>{contactPhone}</a> : <span>Phone: add business phone</span>}
            {socialLinks.map(([label, url]) => <a href={url} target="_blank" rel="noopener noreferrer" key={label}>{label} ↗</a>)}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} RLV NEXUS. All rights reserved.</span>
          <span className="footer-made">Made with <span aria-label="love">♥</span> by RLV NEXUS</span>
        </div>
      </div>
    </footer>
  );
}
