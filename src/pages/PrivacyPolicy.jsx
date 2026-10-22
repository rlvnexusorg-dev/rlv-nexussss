import SEO from "../components/SEO.jsx";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy" description="Privacy information for the RLV NEXUS website and contact form." path="/privacy-policy" />
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><span>Home</span><span>/</span><span>Privacy Policy</span></div>
        <span className="eyebrow">Your privacy</span><h1>Privacy <span className="gradient-text">policy.</span></h1>
        <p>This starter policy must be reviewed and customized for your actual business, Firebase project configuration, and applicable laws before launch.</p>
      </div></section>
      <section className="content-section"><div className="container prose">
        <h2>About this policy</h2><p>This page is a starter template for RLV NEXUS and is not legal advice. Update it with the correct legal entity, contact details, jurisdiction, service providers, and practices before publishing.</p>
        <h2>Information submitted through this website</h2><p>When the Firebase contact integration is configured, the form sends the details you provide (such as your name, email, phone number, business, requested service, budget, and project description) to a server-side function and stores the enquiry in a private Firestore collection so an authorized RLV NEXUS administrator can respond. Firebase App Check helps protect the submission endpoint. The endpoint uses the request IP transiently for rate limiting and stores a time-bucketed hash rather than the raw IP in its rate-limit record. Configure and disclose your actual retention period, Firebase region, processors, and privacy contact before launch. If the Firebase integration is not configured, the form does not send or retain enquiries.</p>
        <h2>Cookies and analytics</h2><p>No analytics or advertising integrations are configured in this starter project. Add an accurate explanation and any required consent controls if those tools are introduced.</p>
        <h2>External links</h2><p>This website may link to external resources. Their privacy practices are governed by their own policies.</p>
        <h2>Contact</h2><p>Add the verified RLV NEXUS privacy contact and business address before launch. No personal or company contact details have been invented for this template.</p>
      </div></section>
    </>
  );
}
