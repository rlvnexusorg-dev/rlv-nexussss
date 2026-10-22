import { ArrowUpRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { safeExternalUrl } from "../lib/url.js";

export default function ClientCard({ client, projects = [] }) {
  const logoUrl = safeExternalUrl(client.logo) ? client.logo : "";
  return (
    <article className="client-card">
      <div className="client-mark">{logoUrl ? <img src={logoUrl} alt={`${client.name} logo`} loading="lazy" /> : <Building2 size={19} />}</div>
      <span className="client-industry">{client.industry}</span>
      <h3>{client.name}</h3>
      <p>{client.description}</p>
      <div className="project-actions">
        {safeExternalUrl(client.websiteUrl) && <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer">Website <ArrowUpRight size={13} /></a>}
        {safeExternalUrl(client.androidUrl) && <a href={client.androidUrl} target="_blank" rel="noopener noreferrer">Android <ArrowUpRight size={13} /></a>}
        {safeExternalUrl(client.iosUrl) && <a href={client.iosUrl} target="_blank" rel="noopener noreferrer">iOS <ArrowUpRight size={13} /></a>}
        {client.projectIds.map((id) => {
          const project = projects.find((item) => item.id === id);
          return project ? <Link key={id} to={`/projects/${project.slug}`}>Related project <ArrowUpRight size={13} /></Link> : null;
        })}
      </div>
    </article>
  );
}
