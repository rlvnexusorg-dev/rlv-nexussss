import { ArrowRight, BrainCircuit, MessagesSquare, MonitorCheck, Puzzle, Scaling, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ClientCard from "../components/ClientCard.jsx";
import TestimonialSlider from "../components/TestimonialSlider.jsx";
import CTASection from "../components/CTASection.jsx";
import Reveal from "../components/Reveal.jsx";
import SEO from "../components/SEO.jsx";
import { services } from "../data/services.js";
import { publishedProjects } from "../data/projects.js";
import { clients } from "../data/clients.js";
import { safeExternalUrl } from "../lib/url.js";
import usePublicCollection from "../hooks/usePublicCollection.js";
import { testimonials } from "../data/testimonials.js";
import ContentStatus from "../components/ContentStatus.jsx";

const values = [
  { icon: MonitorCheck, title: "Business-focused solutions", text: "Start with the outcome you need, then choose the right digital approach to support it." },
  { icon: Sparkles, title: "Modern, responsive design", text: "Thoughtful interfaces that adapt to real people and the screens they use." },
  { icon: MessagesSquare, title: "Transparent communication", text: "Clear scope, useful updates, and conversations without unnecessary jargon." },
  { icon: Scaling, title: "Scalable technology", text: "Flexible foundations designed to support your product as needs evolve." },
  { icon: ShieldCheck, title: "Reliable support", text: "A clear path to ongoing technical help, maintenance, and future improvements." },
  { icon: Puzzle, title: "Tailored to your business", text: "No one-size-fits-all package. Each engagement starts with your context." },
];

const steps = [
  ["01", "Discover", "We listen, ask useful questions, and understand what success means to you."],
  ["02", "Plan", "We define the direction, scope, and practical next steps together."],
  ["03", "Build", "We design, develop, and test your solution with care."],
  ["04", "Launch & Support", "We prepare for launch and help you plan for what comes next."],
];

export default function Home() {
  const liveProjects = usePublicCollection("projects", publishedProjects);
  const liveClients = usePublicCollection("clients", clients);
  const liveReviews = usePublicCollection("testimonials", testimonials);
  const liveServices = usePublicCollection("services", services);
  const featuredProjects = liveProjects.data
    .filter((project) => project.featured)
    .slice(0, 2);

  return (
    <>
      <SEO />
      <Hero />
      {liveClients.data.length > 0 && <section className="logo-strip" aria-label="Client information">
        <div className="container logo-strip-inner">
          <p className="logo-strip-label">Trusted partnerships are built together</p>
          {liveClients.data.slice(0, 6).map((client) => <span className="logo-client" key={client.id}>{safeExternalUrl(client.logo) ? <img src={client.logo} alt={`${client.name} logo`} loading="lazy" /> : client.name}</span>)}
        </div>
      </section>}

      <section className="section" id="services">
        <div className="container">
          <div className="section-topline">
            <div className="section-heading">
              <span className="eyebrow">What we do · From idea to impact</span>
              <h2>Make your next digital move <span className="gradient-text">count.</span></h2>
              <p>One connected team for the website, app, software, and marketing your business needs to move forward—with a clear plan at every step.</p>
            </div>
            <Link className="text-link" to="/services">Explore all services <ArrowRight size={14} /></Link>
          </div>
          <ContentStatus status={liveServices.status} error={liveServices.error} />
          <div className="service-grid">{liveServices.data.map((service, index) => <ServiceCard service={service} index={index} key={service.id} />)}</div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-topline">
            <div className="section-heading">
              <span className="eyebrow">Selected work</span>
              <h2>Apps and software, <span className="gradient-text">built with care.</span></h2>
              <p>Only published project work appears here.</p>
            </div>
            <Link className="text-link" to="/projects">View portfolio <ArrowRight size={14} /></Link>
          </div>
          <ContentStatus status={liveProjects.status} error={liveProjects.error} />
          {featuredProjects.length ? <div className="project-grid">{featuredProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : liveProjects.status !== "loading" && <div className="empty-state">No projects have been published yet.</div>}
        </div>
      </section>

      {liveClients.data.length > 0 && <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our clients & partners</span>
            <h2>Good work starts<br />with <span className="gradient-text">good people.</span></h2>
            <p>Published client profiles and the work connected with them.</p>
          </div>
          <ContentStatus status={liveClients.status} error={liveClients.error} />
          <div className="client-grid">{liveClients.data.slice(0, 3).map((client) => <ClientCard client={client} projects={liveProjects.data} key={client.id} />)}</div>
          <p style={{ marginTop: 22 }}><Link className="text-link" to="/clients">View all clients <ArrowRight size={14} /></Link></p>
        </div>
      </section>}

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Why RLV NEXUS</span>
            <h2>Good technology.<br /><span className="gradient-text">Clear thinking.</span></h2>
            <p>We keep the work grounded in your goals, with collaborative decisions from the first conversation to launch.</p>
          </div>
          <div className="value-grid">{values.map(({ icon: Icon, title, text }) => (
            <Reveal key={title}><article className="value-card"><Icon className="value-icon" size={20} /><h3>{title}</h3><p>{text}</p></article></Reveal>
          ))}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">A thoughtful process</span>
            <h2>From first thought<br />to <span className="gradient-text">what&apos;s next.</span></h2>
          </div>
          <div className="process-grid">{steps.map(([number, title, text]) => (
            <Reveal key={number}><article className="process-step"><span className="process-number">{number}</span><h3>{title}</h3><p>{text}</p></article></Reveal>
          ))}</div>
        </div>
      </section>

      {liveReviews.data.length > 0 && <section className="section section-muted">
        <div className="container">
          <div className="section-heading" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Words from our clients</span>
            <h2>Experiences worth <span className="gradient-text">sharing.</span></h2>
            <p style={{ marginInline: "auto" }}>Only approved client reviews are shown here.</p>
          </div>
          <ContentStatus status={liveReviews.status} error={liveReviews.error} />
          <TestimonialSlider testimonials={liveReviews.data} />
        </div>
      </section>}

      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
