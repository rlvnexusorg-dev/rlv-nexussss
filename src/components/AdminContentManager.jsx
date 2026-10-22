import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { listenToAdminCollection, removeContent, saveContent, updateContent } from "../lib/contentAdmin.js";
import { safeExternalUrl } from "../lib/url.js";

const fields = {
  projects: [
    ["title", "Project name", "text", true],
    ["slug", "Project URL slug", "text", true],
    ["clientId", "Client record ID", "text"],
    ["category", "Category", "select", true, ["Websites", "Mobile Apps", "E-commerce", "SaaS", "Marketing"]],
    ["description", "Short description", "textarea", true],
    ["thumbnail", "Cover image URL (HTTP or HTTPS)", "url", true],
    ["thumbnailAlt", "Cover image description", "text", true],
    ["videoUrl", "Project video URL (optional)", "url"],
    ["gallery", "Gallery image URLs (HTTP/HTTPS, one per line)", "list"],
    ["technologies", "Technologies (comma-separated)", "list"],
    ["technologyIcons", "Custom tech icons (one per line: name | URL)", "map"],
    ["completionDate", "Completion date", "text"],
    ["websiteUrl", "Live website URL", "url"],
    ["androidUrl", "Android app URL", "url"],
    ["iosUrl", "iOS app URL", "url"],
    ["githubUrl", "Public GitHub URL", "url"],
    ["caseStudyUrl", "External case-study URL", "url"],
    ["businessChallenge", "Business challenge", "textarea"],
    ["solution", "Solution", "textarea"],
    ["keyFeatures", "Key features (one per line)", "list"],
    ["results", "Verified results (leave blank if unverified)", "textarea"],
    ["featured", "Feature on homepage", "checkbox"],
    ["published", "Visible on the public website", "checkbox"],
  ],
  services: [
    ["title", "Service title", "text", true],
    ["slug", "Service URL slug", "text", true],
    ["description", "Description", "textarea", true],
    ["icon", "Icon", "select", true, ["website", "mobile", "ecommerce", "software", "marketing", "messaging", "automation", "design", "support"]],
    ["displayOrder", "Display order", "number", true],
    ["featured", "Feature service", "checkbox"],
    ["published", "Visible on the public website", "checkbox"],
  ],
  clients: [
    ["name", "Client / company name", "text", true],
    ["slug", "Client URL slug", "text", true],
    ["logo", "Logo URL (HTTP or HTTPS)", "url"],
    ["industry", "Industry", "text", true],
    ["description", "Description of approved work", "textarea", true],
    ["websiteUrl", "Website URL", "url"],
    ["androidUrl", "Android app URL", "url"],
    ["iosUrl", "iOS app URL", "url"],
    ["projectIds", "Related project IDs (one per line)", "list"],
    ["published", "Visible on the public website", "checkbox"],
  ],
  testimonials: [
    ["quote", "Approved client review", "textarea", true],
    ["name", "Client name", "text", true],
    ["role", "Client role", "text", true],
    ["company", "Company", "text", true],
    ["photo", "Client photo URL (HTTP or HTTPS)", "url"],
    ["published", "Visible on the public website", "checkbox"],
  ],
};

const labels = { projects: "Projects", clients: "Clients", services: "Services", testimonials: "Reviews", enquiries: "Enquiries" };
const emptyRecord = {
  projects: { category: "Websites", technologies: [], technologyIcons: {}, gallery: [], keyFeatures: [], published: false, featured: false },
  clients: { projectIds: [], published: false },
  services: { icon: "website", displayOrder: 0, published: false, featured: false },
  testimonials: { published: false },
};

function formValue(value, type, key) {
  if (type === "checkbox") return Boolean(value);
  if (type === "list") return Array.isArray(value) ? value.join(key === "technologies" ? ", " : "\n") : value || "";
  if (type === "map") return Object.entries(value || {}).map(([name, url]) => `${name} | ${url}`).join("\n");
  return value ?? "";
}

function parseList(value, key) {
  const separator = key === "gallery" || key === "keyFeatures" || key === "projectIds" ? /\n/ : /,/;
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

function parseMap(value) {
  return Object.fromEntries(value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const separator = line.indexOf("|");
    return separator > 0 ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] : ["", ""];
  }));
}

function toRecord(form, collectionName) {
  const record = {};
  for (const [key, , type] of fields[collectionName]) {
    const value = form[key];
    if (type === "checkbox") record[key] = Boolean(value);
    else if (type === "list") record[key] = parseList(String(value || ""), key);
    else if (type === "map") record[key] = parseMap(String(value || ""));
    else if (type === "number") record[key] = Number(value);
    else record[key] = String(value ?? "").trim();
  }

  if (["projects", "clients", "services"].includes(collectionName) && !record.slug) {
    const slugSource = collectionName === "clients" ? record.name : record.title;
    record.slug = slugSource.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  return record;
}

function validateRecord(record, collectionName, currentItems, editingId) {
  if (collectionName === "enquiries") return "";
  const invalidUrls = fields[collectionName]
    .filter(([, , type]) => type === "url")
    .map(([key, label]) => [key, label])
    .filter(([key]) => record[key] && !safeExternalUrl(record[key]));

  if (invalidUrls.length) return `${invalidUrls.map(([, label]) => label).join(", ")} must use a valid HTTP or HTTPS URL.`;
  if (collectionName === "projects" && record.gallery.some((url) => !safeExternalUrl(url))) {
    return "Every gallery image must use a valid HTTP or HTTPS URL.";
  }
  if (collectionName === "projects" && Object.entries(record.technologyIcons).some(([name, url]) => !name || !safeExternalUrl(url))) {
    return "Enter each custom technology icon as name | HTTP or HTTPS URL.";
  }
  if (["projects", "clients", "services"].includes(collectionName) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    return "Use a URL slug with lowercase letters, numbers, and hyphens only.";
  }
  if (["projects", "clients", "services"].includes(collectionName) && currentItems.some((item) => item.slug === record.slug && item.id !== editingId)) {
    return "That URL slug is already in use. Choose a unique slug.";
  }
  return "";
}

export default function AdminContentManager({ collectionName }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...emptyRecord[collectionName] });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => listenToAdminCollection(
    collectionName,
    (records) => {
      setItems(records);
      setLoading(false);
    },
    (cause) => {
      console.error(`Could not load ${collectionName} admin records:`, cause);
      setError(cause.message || "Could not load records.");
      setLoading(false);
    },
  ), [collectionName]);

  const sortedItems = useMemo(() => [...items]
    .filter((item) => `${item.title || ""} ${item.name || ""} ${item.category || ""} ${item.quote || ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => collectionName === "services"
      ? (a.displayOrder || 0) - (b.displayOrder || 0)
      : (a.title || a.name || "").localeCompare(b.title || b.name || "")), [items, search, collectionName]);

  function resetForm() {
    setForm({ ...emptyRecord[collectionName] });
    setEditingId("");
    setError("");
    setSuccess("");
  }

  function editItem(item) {
    setForm({ ...item });
    setEditingId(item.id);
    setError("");
    setSuccess("");
    document.querySelector(".admin-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleFieldChange(key, value) {
    setForm((current) => {
      const titleKey = collectionName === "clients" ? "name" : "title";
      if (!["projects", "clients", "services"].includes(collectionName) || key !== titleKey) return { ...current, [key]: value };
      const previousSlug = String(current[titleKey] || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const generatedSlug = String(value)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return {
        ...current,
        [titleKey]: value,
        slug: !current.slug || current.slug === previousSlug ? generatedSlug : current.slug,
      };
    });
  }

  async function reorderService(item, direction) {
    const index = sortedItems.findIndex((record) => record.id === item.id);
    const neighbor = sortedItems[index + direction];
    if (!neighbor) return;
    const currentOrder = item.displayOrder || index;
    const neighborOrder = neighbor.displayOrder ?? index + direction;
    try {
      await Promise.all([
        updateContent(collectionName, item.id, { displayOrder: neighborOrder }),
        updateContent(collectionName, neighbor.id, { displayOrder: currentOrder }),
      ]);
    } catch (cause) {
      console.error("Could not reorder services:", cause);
      setError(cause.message || "Could not reorder services.");
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    const record = toRecord(form, collectionName);
    const validationMessage = validateRecord(record, collectionName, items, editingId);
    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveContent(collectionName, editingId, record);
      resetForm();
      setSuccess("Saved. Published changes will update on the website automatically.");
    } catch (cause) {
      console.error(`Could not save ${collectionName} record:`, cause);
      setError(cause.code === "permission-denied"
        ? "Save denied. Publish the latest Firestore rules and sign in with an approved admin account."
        : cause.message || "Could not save the record.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const label = item.title || item.name || item.quote;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError("");
    setSuccess("");
    try {
      await removeContent(collectionName, item.id);
      if (editingId === item.id) resetForm();
      setSuccess("Record deleted.");
    } catch (cause) {
      console.error(`Could not delete ${collectionName} record:`, cause);
      setError(cause.code === "permission-denied"
        ? "Delete denied. Check the admin account and published Firestore rules."
        : cause.message || "Could not delete the record.");
    }
  }

  return (
    <div className="admin-manager">
      <div className="admin-list">
        <div className="admin-list-heading"><h2>{labels[collectionName]} <span>{items.length}</span></h2><button className="button-secondary" type="button" onClick={resetForm}><Plus size={15} /> Add new</button></div>
        <input className="admin-search" aria-label={`Search ${labels[collectionName]}`} placeholder={`Search ${labels[collectionName.toLowerCase()]}…`} value={search} onChange={(event) => setSearch(event.target.value)} />
        {loading ? <p className="admin-muted">Loading Firebase records…</p> : sortedItems.length === 0 ? <p className="admin-muted">{search ? "No matching records." : "No records yet. Add one with the form."}</p> : sortedItems.map((item, index) => {
          const title = item.title || item.name || item.quote;
          return (
            <article className="admin-record" key={item.id}>
              <div><strong>{title}</strong><span>{item.published ? "Published" : "Draft"} · {item.category || item.company || labels[collectionName].slice(0, -1)} · ID: {item.id}</span></div>
              <div className="admin-record-actions">{collectionName === "services" && <><button className="icon-button" type="button" aria-label={`Move ${title} up`} disabled={index === 0} onClick={() => reorderService(item, -1)}><ArrowUp size={14} /></button><button className="icon-button" type="button" aria-label={`Move ${title} down`} disabled={index === sortedItems.length - 1} onClick={() => reorderService(item, 1)}><ArrowDown size={14} /></button></>}<button className="icon-button" type="button" aria-label={`Edit ${title}`} onClick={() => editItem(item)}><Pencil size={14} /></button><button className="icon-button danger" type="button" aria-label={`Delete ${title}`} onClick={() => handleDelete(item)}><Trash2 size={14} /></button></div>
            </article>
          );
        })}
      </div>

      <form className="contact-panel admin-editor" onSubmit={handleSave}>
        <div className="admin-list-heading"><h2>{editingId ? "Edit record" : `Add ${labels[collectionName].slice(0, -1)}`}</h2>{editingId && <button className="icon-button" type="button" aria-label="Cancel edit" onClick={resetForm}><X size={14} /></button>}</div>
        <div className="form-grid">
          {fields[collectionName].map(([key, label, type, required, options]) => (
            <div className={`form-field ${type === "textarea" || type === "list" || type === "map" ? "full" : ""}`} key={key}>
              {type === "checkbox" ? (
                <label className="admin-checkbox"><input name={key} type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />{label}</label>
              ) : (
                <>
                  <label htmlFor={`admin-${collectionName}-${key}`}>{label}{required ? " *" : ""}</label>
                  {type === "textarea" || type === "list" || type === "map" ? (
                    <textarea id={`admin-${collectionName}-${key}`} required={required} value={formValue(form[key], type, key)} onChange={(event) => handleFieldChange(key, event.target.value)} placeholder={type === "map" ? "React | https://example.com/react.svg" : type === "list" ? key === "technologies" ? "React, TypeScript, Firebase" : "Enter one item per line" : ""} />
                  ) : type === "number" ? (
                    <input id={`admin-${collectionName}-${key}`} type="number" min="0" required={required} value={form[key] ?? 0} onChange={(event) => handleFieldChange(key, event.target.value)} />
                  ) : type === "select" ? (
                    <select id={`admin-${collectionName}-${key}`} required={required} value={form[key] || ""} onChange={(event) => handleFieldChange(key, event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>
                  ) : (
                    <input id={`admin-${collectionName}-${key}`} type={type === "url" ? "url" : "text"} required={required} value={formValue(form[key], type, key)} onChange={(event) => handleFieldChange(key, event.target.value)} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <p className="form-note">Only approved client details should be published. Add images with public HTTP or HTTPS URLs.</p>
        {error && <p className="form-status" role="alert">{error}</p>}
        {success && <p className="form-status success" role="status">{success}</p>}
        <button className="button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : <><Save size={14} /> Save {labels[collectionName].slice(0, -1)}</>}</button>
      </form>
    </div>
  );
}
