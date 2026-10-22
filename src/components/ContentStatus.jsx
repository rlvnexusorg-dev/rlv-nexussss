export default function ContentStatus({ status, error }) {
  if (status === "demo" || status === "ready") return null;

  return (
    <p className={`content-status ${status === "error" ? "error" : ""}`} role="status">
      {error || "Loading live content…"}
    </p>
  );
}
