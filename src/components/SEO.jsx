import { Helmet } from "react-helmet-async";

const SITE_NAME = "RLV NEXUS";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://rlvnexus.example";

export default function SEO({ title, description, path = "", noIndex = false }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Digital Solutions. Real Business Growth.`;
  const pageDescription = description || "We design and develop websites, mobile applications, and intelligent digital solutions that help businesses stand out and scale.";
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
