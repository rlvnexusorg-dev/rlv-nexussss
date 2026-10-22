import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="container cta-section" aria-labelledby="cta-title">
      <div className="cta-content">
        <span className="eyebrow"><span className="eyebrow-dot" /> Your next chapter starts here</span>
        <h2 id="cta-title">Have an Idea? Let&apos;s Build It Together.</h2>
        <p>Tell us what you&apos;re working toward. We&apos;ll help you find a thoughtful way to make it happen.</p>
        <div className="cta-actions">
          <Link className="button-primary" to="/contact">Start Your Project <ArrowRight size={15} /></Link>
          <Link className="button-secondary" to="/contact">Contact RLV NEXUS</Link>
        </div>
      </div>
    </section>
  );
}
