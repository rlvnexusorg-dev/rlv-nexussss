import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/SEO.jsx";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="The requested page could not be found." noIndex />
      <section className="container not-found">
        <span className="eyebrow">404 · Page not found</span>
        <h1 className="gradient-text">Lost in the nexus.</h1>
        <p>The link may be outdated, or the page may have moved.</p>
        <Link className="button-primary" to="/"><ArrowLeft size={15} /> Back to home</Link>
      </section>
    </>
  );
}
