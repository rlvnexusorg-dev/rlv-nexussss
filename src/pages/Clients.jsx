import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ClientCard from "../components/ClientCard.jsx";
import CTASection from "../components/CTASection.jsx";
import SEO from "../components/SEO.jsx";
import { CLIENTS_DATA_NOTICE, clients } from "../data/clients.js";
import usePublicCollection from "../hooks/usePublicCollection.js";
import ContentStatus from "../components/ContentStatus.jsx";
import { publishedProjects } from "../data/projects.js";

export default function Clients() {
  const liveClients = usePublicCollection("clients", clients);
  const liveProjects = usePublicCollection("projects", publishedProjects);
  const intro = liveClients.isFirebase
    ? "Browse client profiles approved for public display. Add and update them in the RLV NEXUS content admin."
    : "We believe good digital work comes from listening and working closely together. Client details will only be added with permission.";

  return (
    <>
      <SEO title="Our Clients & Partners" description={intro} path="/clients" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>Clients</span></div>
        <span className="eyebrow">Our clients & partners</span>
        <h1>Built through <span className="gradient-text">partnership.</span></h1>
        <p>{intro}</p>
      </div></section>
      <section className="content-section"><div className="container">
        <ContentStatus status={liveClients.status} error={liveClients.error} />
        <ContentStatus status={liveProjects.status} error={liveProjects.error} />
        {liveClients.data.length ? <div className="client-grid">{liveClients.data.map((client) => <ClientCard client={client} projects={liveProjects.data} key={client.id} />)}</div> : liveClients.status === "ready" ? <div className="empty-state"><strong>Client showcase awaiting approved details</strong><br />{CLIENTS_DATA_NOTICE}<br /><br /><Link className="text-link" to="/admin">Add approved client records in the admin page <ArrowRight size={13} /></Link></div> : null}
      </div></section>
      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
