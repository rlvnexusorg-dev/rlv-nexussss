import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { services } from "../data/services.js";

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="RLV NEXUS home">
      <span className="brand-mark">RN</span>
      <span>RLV <span className="brand-nexus">NEXUS</span></span>
    </Link>
  );
}

export { Brand };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav className={`nav-links ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/" end onClick={closeMenu}>Home</NavLink>
          <div className="nav-dropdown">
            <button className="nav-dropdown-trigger" type="button" aria-expanded={servicesOpen} onClick={() => setServicesOpen(!servicesOpen)}>
              Services <ChevronDown size={13} />
            </button>
            {servicesOpen && (
              <div className="dropdown-panel">
                <Link to="/services" onClick={closeMenu}>All services</Link>
                {services.slice(0, 5).map((service) => <Link to="/services" key={service.id} onClick={closeMenu}>{service.title}</Link>)}
              </div>
            )}
          </div>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/projects" onClick={closeMenu}>Projects</NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/clients" onClick={closeMenu}>Clients</NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/about" onClick={closeMenu}>About</NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/account" onClick={closeMenu}>My account</NavLink>
          <Link className="header-cta" to="/contact" onClick={closeMenu}>Let&apos;s Talk <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
