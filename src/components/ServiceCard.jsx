import { ArrowUpRight, Bot, Code2, Globe2, Mail, Megaphone, MonitorSmartphone, Palette, ShoppingBag, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";

const iconMap = { website: Globe2, mobile: MonitorSmartphone, ecommerce: ShoppingBag, software: Code2, marketing: Megaphone, messaging: Mail, automation: Bot, design: Palette, support: Wrench };

export default function ServiceCard({ service, index = 0 }) {
  const Icon = iconMap[service.icon] || Code2;
  const number = String(index + 1).padStart(2, "0");
  return (
    <Reveal className="service-reveal" delay={(index % 3) * 0.07}>
      <article className="service-card" style={{ "--service-index": index }}>
        <div className="service-card-top">
          <span className="service-icon"><Icon size={22} strokeWidth={1.7} /></span>
          <span className="service-number">{number}</span>
        </div>
        <div className="service-copy">
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
        <Link className="service-link" to="/services" aria-label={`Learn more about ${service.title}`}>
          <span>Explore service</span>
          <span className="service-link-icon"><ArrowUpRight size={15} /></span>
        </Link>
      </article>
    </Reveal>
  );
}
