import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ProjectCard from "../components/ProjectCard.jsx";
import CTASection from "../components/CTASection.jsx";
import MediaEmbed from "../components/MediaEmbed.jsx";
import TechnologyIcon from "../components/TechnologyIcon.jsx";
import SEO from "../components/SEO.jsx";
import { publishedProjects } from "../data/projects.js";
import { clients } from "../data/clients.js";
import { safeExternalUrl } from "../lib/url.js";
import NotFound from "./NotFound.jsx";
import usePublicCollection from "../hooks/usePublicCollection.js";
import ContentStatus from "../components/ContentStatus.jsx";

export default function ProjectDetails() {
  const { slug } = useParams();
  const liveProjects = usePublicCollection("projects", publishedProjects);
  const liveClients = usePublicCollection("clients", clients);
  const project = liveProjects.data.find((item) => item.slug === slug);
  if (!project && liveProjects.status === "loading") {
    return <section className="container content-section"><ContentStatus status={liveProjects.status} /></section>;
  }
  if (!project && liveProjects.status === "error") {
    return <section className="container content-section"><ContentStatus status={liveProjects.status} error={liveProjects.error} /></section>;
  }
  if (!project) return <NotFound />;

  const client = liveClients.data.find((item) => item.id === project.clientId);
  const related = liveProjects.data.filter((item) => item.id !== project.id && item.category === project.category).slice(0, 2);
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const galleryImages = gallery.filter(safeExternalUrl);
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];
  const iconFor = (name) => Object.entries(project.technologyIcons || {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || "";
  const heroImage = safeExternalUrl(project.thumbnail) ? project.thumbnail : "";
  const links = [
    ["Live website", project.websiteUrl],
    ["Android app", project.androidUrl],
    ["iOS app", project.iosUrl],
    ["Public GitHub", project.githubUrl],
    ["External case study", project.caseStudyUrl],
  ].filter(([, url]) => safeExternalUrl(url));

  return (
    <>
      <SEO title={project.title} description={project.description} path={`/projects/${project.slug}`} />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/projects">Projects</Link><span>/</span><span>{project.title}</span></div>
        <span className="eyebrow">{project.category}</span>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </div></section>
      <section className="content-section"><div className="container">
        {heroImage && <img className="detail-hero-image" src={heroImage} alt={project.thumbnailAlt || `${project.title} project preview`} />}
        {project.videoUrl && <div className="project-video"><MediaEmbed url={project.videoUrl} title={`${project.title} video`} /></div>}
        <div className="detail-columns">
          <div className="prose">
            <h2>Overview</h2><p>{project.description}</p>
            {project.businessChallenge && <><h2>Business challenge</h2><p>{project.businessChallenge}</p></>}
            {project.solution && <><h2>Our solution</h2><p>{project.solution}</p></>}
            {Array.isArray(project.keyFeatures) && project.keyFeatures.length > 0 && <><h2>Key features</h2><ul>{project.keyFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul></>}
            {galleryImages.length > 1 && <><h2>Project gallery</h2><div className="project-grid">{galleryImages.map((image, index) => <img className="detail-hero-image" style={{ margin: 0 }} src={image} alt={`${project.thumbnailAlt || project.title} — gallery ${index + 1}`} loading="lazy" key={image} />)}</div></>}
            {project.results && <><h2>Results</h2><p>{project.results}</p></>}
          </div>
          <aside className="detail-sidebar">
            <h3>Project details</h3>
            <dl><dt>Category</dt><dd>{project.category}</dd>{client?.name && <><dt>Client</dt><dd>{client.name}</dd></>}{project.completionDate && <><dt>Completion</dt><dd>{project.completionDate}</dd></>}{technologies.length > 0 && <><dt>Technologies</dt><dd><div className="tag-list">{technologies.map((technology) => <span className="tag technology-tag" key={technology}><TechnologyIcon name={technology} iconUrl={iconFor(technology)} />{technology}</span>)}</div></dd></>}</dl>
            {links.length > 0 ? <div className="project-actions">{links.map(([label, url]) => <a href={url} target="_blank" rel="noopener noreferrer" key={label}>{label} <ArrowUpRight size={13} /></a>)}</div> : <p className="form-note" style={{ marginTop: 20 }}>No public website, app, or repository link has been provided.</p>}
          </aside>
        </div>
        {related.length > 0 && <div style={{ marginTop: 70 }}><h2 className="content-title">Related projects</h2><div className="project-grid">{related.map((item) => <ProjectCard project={item} key={item.id} />)}</div></div>}
        <p style={{ marginTop: 35 }}><Link className="text-link" to="/projects"><ArrowLeft size={14} /> Back to projects</Link></p>
      </div></section>
      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
