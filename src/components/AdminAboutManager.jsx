import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { defaultAboutContent } from "../data/about.js";
import { db } from "../lib/firebase.js";
import { safeExternalUrl } from "../lib/url.js";

function iconLines(icons) {
  return Object.entries(icons || {}).map(([name, url]) => `${name} | ${url}`).join("\n");
}

export default function AdminAboutManager() {
  const [form, setForm] = useState({ ...defaultAboutContent, technologies: defaultAboutContent.technologies.join(", "), technologyIcons: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }
    getDoc(doc(db, "settings", "about")).then((snapshot) => {
      if (snapshot.exists()) {
        const content = snapshot.data();
        setForm({
          ...defaultAboutContent,
          ...content,
          technologies: (content.technologies || []).join(", "),
          technologyIcons: iconLines(content.technologyIcons),
        });
      }
    }).catch((cause) => {
      console.error("Could not load About content:", cause);
      setError(cause.code === "permission-denied" ? "About content is blocked. Sign in as admin and publish the latest Firestore rules." : "Could not load About content.");
    }).finally(() => setLoading(false));
    return undefined;
  }, []);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    const imageUrl = form.imageUrl.trim();
    const videoUrl = form.videoUrl.trim();
    if ((imageUrl && !safeExternalUrl(imageUrl)) || (videoUrl && !safeExternalUrl(videoUrl))) {
      setError("Photo and video must use a valid HTTP or HTTPS URL.");
      return;
    }

    const technologies = form.technologies.split(",").map((name) => name.trim()).filter(Boolean);
    const technologyIcons = {};
    for (const line of form.technologyIcons.split("\n").map((item) => item.trim()).filter(Boolean)) {
      const separator = line.indexOf("|");
      const name = line.slice(0, separator).trim();
      const url = line.slice(separator + 1).trim();
      if (separator < 1 || !name || !safeExternalUrl(url)) {
        setError("Enter icon URLs as: Language name | https://icon-url");
        return;
      }
      technologyIcons[name] = url;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await setDoc(doc(db, "settings", "about"), {
        title: form.title.trim(),
        intro: form.intro.trim(),
        storyTitle: form.storyTitle.trim(),
        story: form.story.trim(),
        imageUrl,
        imageAlt: form.imageAlt.trim(),
        videoUrl,
        technologies,
        technologyIcons,
        published: Boolean(form.published),
        updatedAt: serverTimestamp(),
      });
      setSuccess("About page updated.");
    } catch (cause) {
      console.error("Could not save About content:", cause);
      setError(cause.code === "permission-denied" ? "Save denied. Publish the latest Firestore rules and confirm this is an admin account." : "Could not save About content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="contact-panel about-editor" onSubmit={handleSave}>
      <div className="admin-list-heading"><h2>Edit About page</h2><span className="admin-muted">Text, media, toolkit</span></div>
      {loading ? <p className="admin-muted" role="status">Loading About content…</p> : <>
        <div className="form-grid">
          <div className="form-field full"><label htmlFor="about-title">Page heading</label><input id="about-title" required maxLength={180} value={form.title} onChange={(event) => change("title", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-intro">Short introduction</label><textarea id="about-intro" required maxLength={1000} value={form.intro} onChange={(event) => change("intro", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-story-title">Story heading</label><input id="about-story-title" required maxLength={100} value={form.storyTitle} onChange={(event) => change("storyTitle", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-story">About text</label><textarea id="about-story" required maxLength={4000} value={form.story} onChange={(event) => change("story", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-image">Photo URL (optional)</label><input id="about-image" type="url" placeholder="https://" value={form.imageUrl} onChange={(event) => change("imageUrl", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-image-alt">Photo description</label><input id="about-image-alt" maxLength={180} value={form.imageAlt} onChange={(event) => change("imageAlt", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-video">Video URL (optional)</label><input id="about-video" type="url" placeholder="YouTube, Vimeo, or MP4 URL" value={form.videoUrl} onChange={(event) => change("videoUrl", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-technologies">Languages and tools</label><textarea id="about-technologies" required placeholder="JavaScript, React, Firebase" value={form.technologies} onChange={(event) => change("technologies", event.target.value)} /></div>
          <div className="form-field full"><label htmlFor="about-technology-icons">Custom icon URLs (one per line)</label><textarea id="about-technology-icons" placeholder={"JavaScript | https://example.com/javascript.svg"} value={form.technologyIcons} onChange={(event) => change("technologyIcons", event.target.value)} /></div>
          <div className="form-field full"><label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(event) => change("published", event.target.checked)} /> Show About content on website</label></div>
        </div>
        {error && <p className="form-status" role="alert">{error}</p>}
        {success && <p className="form-status success" role="status">{success}</p>}
        <button className="button-primary" type="submit" disabled={saving}><Save size={14} /> {saving ? "Saving…" : "Save About page"}</button>
      </>}
    </form>
  );
}