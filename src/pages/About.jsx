import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, Handshake, Lightbulb, ShieldCheck, Target, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import CTASection from "../components/CTASection.jsx";
import ContentStatus from "../components/ContentStatus.jsx";
import MediaEmbed from "../components/MediaEmbed.jsx";
import Reveal from "../components/Reveal.jsx";
import SEO from "../components/SEO.jsx";
import TechnologyIcon from "../components/TechnologyIcon.jsx";
import { defaultAboutContent } from "../data/about.js";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { firebaseConfigured } from "../lib/firebaseConfig.js";
import { safeExternalUrl } from "../lib/url.js";

const approach = [
  [Target, "Business-focused", "Start by understanding the people you serve and the outcomes your business needs."],
  [Lightbulb, "Thoughtfully designed", "Make complex ideas feel clear through considered product and interface decisions."],
  [Workflow, "Built to adapt", "Choose technology that fits the job and can evolve as your requirements change."],
  [Handshake, "Collaborative by default", "Keep decisions and progress visible so the work stays aligned with your team."],
  [ShieldCheck, "Support that continues", "Plan for care after launch, with a practical path for updates and improvements."],
  [BrainCircuit, "Curiosity with purpose", "Explore new tools, including AI, when they solve a real problem for your business."],
];

const process = [
  ["01", "Discover", "Understand the client's goals, audience, and constraints."],
  ["02", "Plan", "Define the strategy, project scope, and next steps."],
  ["03", "Build", "Design, develop, and test the agreed solution."],
  ["04", "Launch & Support", "Deploy thoughtfully and plan how to keep improving."],
];

export default function About() {
  const [content, setContent] = useState(defaultAboutContent);
  const [status, setStatus] = useState(firebaseConfigured ? "loading" : "demo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured || !db) return undefined;
    return onSnapshot(doc(db, "settings", "about"), (snapshot) => {
      if (snapshot.exists()) {
        const record = snapshot.data();
        setContent(record.published === false ? null : { ...defaultAboutContent, ...record });
      }
      setStatus("ready");
      setError("");
    }, (cause) => {
      console.error("Could not load About content:", cause);
      setError("About content could not be loaded. Check the Firestore rules.");
      setStatus("error");
    });
  }, []);

  const iconFor = (name) => Object.entries(content?.technologyIcons || {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || "";

  return (
    <>
      <SEO title="About Us" description="Learn about the RLV NEXUS approach to business-focused digital design, development, and technology." path="/about" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>About</span></div>
        <span className="eyebrow">About RLV NEXUS</span>
        <h1>{content?.title || "About RLV NEXUS"}</h1>
        <p>{content?.intro || "About content has not been published yet."}</p>
      </div></section>
      <ContentStatus status={status} error={error} />
      {content ? <section className="content-section"><div className="container about-story-layout">
        <div className="prose"><h2>{content.storyTitle}</h2>{content.story.split("\n").filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}<Link className="text-link" to="/contact">Talk through an idea <ArrowRight size={14} /></Link></div>
        {safeExternalUrl(content.imageUrl) ? <img className="about-photo" src={content.imageUrl} alt={content.imageAlt || "RLV NEXUS team or workspace"} loading="lazy" /> : <aside className="detail-sidebar"><h3>What we care about</h3><dl><dt>Focus</dt><dd>Business outcomes</dd><dt>Approach</dt><dd>Collaborative &amp; transparent</dd><dt>Technology</dt><dd>Practical &amp; adaptable</dd><dt>Partnership</dt><dd>Tailored to your context</dd></dl></aside>}
      </div>{safeExternalUrl(content.videoUrl) && <div className="container about-video"><MediaEmbed url={content.videoUrl} title="RLV NEXUS introduction" /></div>}</section> : status !== "loading" && <section className="content-section"><div className="container"><div className="empty-state">About content has not been published yet.</div></div></section>}
      <section className="section"><div className="container">
        <div className="section-heading"><span className="eyebrow">Languages &amp; tools</span><h2>Our current <span className="gradient-text">toolkit.</span></h2><p>We pick tools to fit the work. This is the stack behind the current RLV NEXUS website and its Firebase-powered content tools.</p></div>
        <div className="tag-list">{(content?.technologies || defaultAboutContent.technologies).map((tool) => <span className="tag technology-tag" key={tool}><TechnologyIcon name={tool} iconUrl={iconFor(tool)} />{tool}</span>)}</div>
      </div></section>
      <section className="section section-muted"><div className="container">
        <div className="section-heading"><span className="eyebrow">Why RLV NEXUS</span><h2>Thoughtful work.<br /><span className="gradient-text">Useful outcomes.</span></h2></div>
        <div className="value-grid">{approach.map(([Icon, title, text]) => <Reveal key={title}><article className="value-card"><Icon className="value-icon" size={20} /><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div>
      </div></section>
      <section className="section"><div className="container">
        <div className="section-heading"><span className="eyebrow">How we work</span><h2>Four steps.<br /><span className="gradient-text">One shared direction.</span></h2></div>
        <div className="process-grid">{process.map(([number, title, text]) => <Reveal key={number}><article className="process-step"><span className="process-number">{number}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div>
      </div></section>
      <div className="section" style={{ paddingTop: 0 }}><CTASection /></div>
    </>
  );
}
