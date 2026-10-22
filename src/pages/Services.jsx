import ServiceCard from "../components/ServiceCard.jsx";
import CTASection from "../components/CTASection.jsx";
import SEO from "../components/SEO.jsx";
import { Link } from "react-router-dom";
import { services } from "../data/services.js";
import usePublicCollection from "../hooks/usePublicCollection.js";
import ContentStatus from "../components/ContentStatus.jsx";

export default function Services() {
  const liveServices = usePublicCollection("services", services);

  return (
    <>
      <SEO title="Services" description="Explore website, mobile app, software, commerce, design, marketing, and automation services from RLV NEXUS." path="/services" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>Services</span></div>
        <span className="eyebrow">What we do</span>
        <h1>Everything digital. <span className="gradient-text">Built around your business.</span></h1>
        <p>From your first website to the systems that help you scale, get the right expertise, a clear plan, and a solution shaped around the way your business works.</p>
        <Link className="button-primary services-book-link" to="/account">Book a service <span aria-hidden="true">↗</span></Link>
      </div></section>
      <section className="content-section"><div className="container">
        <ContentStatus status={liveServices.status} error={liveServices.error} />
        {liveServices.data.length ? <div className="service-grid">{liveServices.data.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div> : liveServices.status === "ready" ? <div className="empty-state">No services are published yet.</div> : null}
      </div></section>
      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
