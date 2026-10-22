import { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import CTASection from "../components/CTASection.jsx";
import SEO from "../components/SEO.jsx";
import { projectCategories, publishedProjects } from "../data/projects.js";
import usePublicCollection from "../hooks/usePublicCollection.js";
import ContentStatus from "../components/ContentStatus.jsx";

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const liveProjects = usePublicCollection("projects", publishedProjects);
  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return liveProjects.data;
    return liveProjects.data.filter((project) => project.category === activeCategory);
  }, [activeCategory, liveProjects.data]);
  const intro = liveProjects.isFirebase
    ? "Explore published apps, websites, and software projects from RLV NEXUS."
    : "Published project work will appear here.";

  return (
    <>
      <SEO title="Projects" description={intro} path="/projects" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>Projects</span></div>
        <span className="eyebrow">Portfolio</span>
        <h1>Apps, websites, <span className="gradient-text">and software.</span></h1>
        <p>{intro}</p>
      </div></section>
      <section className="content-section"><div className="container">
        <ContentStatus status={liveProjects.status} error={liveProjects.error} />
        <div className="filter-list" role="group" aria-label="Filter projects by category">
          {projectCategories.map((category) => <button className={`filter-button ${activeCategory === category ? "active" : ""}`} type="button" key={category} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
        </div>
        {filteredProjects.length ? <div className="project-grid">{filteredProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : liveProjects.status !== "loading" && <div className="empty-state">No projects have been published yet. <Link className="text-link" to="/admin">Add a project in the admin panel.</Link></div>}
      </div></section>
      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
