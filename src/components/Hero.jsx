import { ArrowDown, ArrowRight, ArrowUpRight, Code2, Globe2, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-inner">
        <Reveal>
          <span className="eyebrow"><span className="eyebrow-dot" /> Digital experiences, built to move you forward</span>
          <h1>Apps &amp; software.<br /><span className="gradient-text">Made for real work.</span></h1>
          <p className="hero-copy">We plan and build mobile apps, websites, and custom software with your team, from the first conversation through launch.</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/projects">See projects <ArrowRight size={15} /></Link>
            <Link className="button-secondary" to="/account">Book a service <ArrowRight size={15} /></Link>
          </div>
          <div className="hero-meta"><span className="meta-rule" /> Strategy-led. Thoughtfully built. Ready for what&apos;s next.</div>
        </Reveal>
        <Reveal className="hero-visual" delay={0.12}>
          <div className="hero-workboard" aria-label="RLV NEXUS digital services">
            <div className="workboard-heading"><span><i className="eyebrow-dot" /> HOW WE HELP</span><span>01 / 03</span></div>
            <Link className="workboard-service" to="/services"><span className="workboard-icon"><Globe2 size={19} /></span><span><strong>Websites</strong><small>Clear, useful, built to last</small></span><ArrowUpRight size={17} /></Link>
            <Link className="workboard-service" to="/services"><span className="workboard-icon"><Smartphone size={19} /></span><span><strong>Mobile apps</strong><small>Made for everyday use</small></span><ArrowUpRight size={17} /></Link>
            <Link className="workboard-service" to="/services"><span className="workboard-icon"><Code2 size={19} /></span><span><strong>Custom software</strong><small>Less busywork, better tools</small></span><ArrowUpRight size={17} /></Link>
            <div className="workboard-footer"><span>Small team. Direct communication.</span><ArrowRight size={14} /></div>
          </div>
        </Reveal>
      </div>
      <a className="hero-scroll" href="#services" aria-label="Scroll to services"><ArrowDown size={15} /></a>
    </section>
  );
}
