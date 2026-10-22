import { ArrowUpRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { safeExternalUrl } from "../lib/url.js";
import TechnologyIcon from "./TechnologyIcon.jsx";

export default function ProjectCard({ project }) {
  const thumbnail = safeExternalUrl(project.thumbnail) ? project.thumbnail : "";
  const iconFor = (name) => Object.entries(project.technologyIcons || {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || "";

  return (
    <article className="project-card">
      <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <div className="project-image-wrap">
          {thumbnail && <img className="project-image" src={thumbnail} alt={project.thumbnailAlt || `${project.title} project preview`} loading="lazy" />}
          <span className="image-overlay" />
        </div>
      </Link>
      <div className="project-card-body">
        <div className="project-kicker"><span>{project.category}</span>{project.completionDate && <span>{project.completionDate}</span>}</div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="tag-list">{project.technologies.map((technology) => <span className="tag technology-tag" key={technology}><TechnologyIcon name={technology} iconUrl={iconFor(technology)} />{technology}</span>)}</div>
        <div className="project-actions">
          <Link to={`/projects/${project.slug}`}>Case study <ArrowUpRight size={13} /></Link>
          {safeExternalUrl(project.websiteUrl) && <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">Live website <ArrowUpRight size={13} /></a>}
          {safeExternalUrl(project.androidUrl) && <a href={project.androidUrl} target="_blank" rel="noopener noreferrer">Android app <ArrowUpRight size={13} /></a>}
          {safeExternalUrl(project.iosUrl) && <a href={project.iosUrl} target="_blank" rel="noopener noreferrer">iOS app <ArrowUpRight size={13} /></a>}
          {safeExternalUrl(project.githubUrl) && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={13} /></a>}
          {safeExternalUrl(project.caseStudyUrl) && <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer">Case study <ArrowUpRight size={13} /></a>}
          {!project.websiteUrl && !project.androidUrl && !project.iosUrl && !project.githubUrl && !project.caseStudyUrl && <span><FolderOpen size={13} /> No public links provided</span>}
        </div>
      </div>
    </article>
  );
}
