import { safeExternalUrl } from "../lib/url.js";

function getEmbedUrl(value) {
  try {
    const url = new URL(value);
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      const videoId = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).at(-1);
      return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
    }
    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const videoId = url.pathname.split("/").filter(Boolean).at(-1);
      return /^\d+$/.test(videoId) ? `https://player.vimeo.com/video/${videoId}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

export default function MediaEmbed({ url, title }) {
  if (!safeExternalUrl(url)) return null;
  const embedUrl = getEmbedUrl(url);
  if (embedUrl) {
    return <div className="media-video"><iframe src={embedUrl} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
  }

  if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url)) {
    return <video className="media-video" controls playsInline preload="metadata"><source src={url} /></video>;
  }
  return <a className="text-link" href={url} target="_blank" rel="noreferrer">Watch {title}</a>;
}