import { Code2 } from "lucide-react";
import flutter from "simple-icons/icons/flutter.svg?raw";
import firebase from "simple-icons/icons/firebase.svg?raw";
import javascript from "simple-icons/icons/javascript.svg?raw";
import kotlin from "simple-icons/icons/kotlin.svg?raw";
import mongodb from "simple-icons/icons/mongodb.svg?raw";
import nextjs from "simple-icons/icons/nextdotjs.svg?raw";
import nodejs from "simple-icons/icons/nodedotjs.svg?raw";
import postgresql from "simple-icons/icons/postgresql.svg?raw";
import python from "simple-icons/icons/python.svg?raw";
import react from "simple-icons/icons/react.svg?raw";
import shopify from "simple-icons/icons/shopify.svg?raw";
import swift from "simple-icons/icons/swift.svg?raw";
import tailwind from "simple-icons/icons/tailwindcss.svg?raw";
import typescript from "simple-icons/icons/typescript.svg?raw";
import wordpress from "simple-icons/icons/wordpress.svg?raw";
import { safeExternalUrl } from "../lib/url.js";

const icons = new Map([
  ["react", react],
  ["javascript", javascript],
  ["typescript", typescript],
  ["next.js", nextjs],
  ["nextjs", nextjs],
  ["node.js", nodejs],
  ["nodejs", nodejs],
  ["firebase", firebase],
  ["flutter", flutter],
  ["kotlin", kotlin],
  ["mongodb", mongodb],
  ["postgresql", postgresql],
  ["postgres", postgresql],
  ["python", python],
  ["shopify", shopify],
  ["swift", swift],
  ["tailwind css", tailwind],
  ["tailwindcss", tailwind],
  ["wordpress", wordpress],
]);

const brandColors = {
  react: "#61dafb",
  javascript: "#f7df1e",
  typescript: "#3178c6",
  "next.js": "#ffffff",
  nextjs: "#ffffff",
  "node.js": "#83cd29",
  nodejs: "#83cd29",
  firebase: "#ffca28",
  flutter: "#54c5f8",
  kotlin: "#a97bff",
  mongodb: "#47a248",
  postgresql: "#4169e1",
  postgres: "#4169e1",
  python: "#3776ab",
  shopify: "#7ab55c",
  swift: "#f05138",
  "tailwind css": "#06b6d4",
  tailwindcss: "#06b6d4",
  wordpress: "#21759b",
};

function getTitle(svg) {
  return svg.match(/<title>([^<]+)<\/title>/)?.[1] || "Technology";
}

function getPath(svg) {
  return svg.match(/<path d="([^"]+)"/)?.[1] || "";
}

export default function TechnologyIcon({ name, iconUrl = "" }) {
  const key = name.trim().toLowerCase();
  if (safeExternalUrl(iconUrl)) return <img className="technology-brand-icon" src={iconUrl} alt="" loading="lazy" />;
  const svg = icons.get(key);
  if (!svg) return <Code2 size={13} aria-hidden="true" />;

  return (
    <svg
      className="technology-brand-icon"
      viewBox="0 0 24 24"
      role="img"
      aria-label={`${getTitle(svg)} logo`}
      focusable="false"
    >
      <path d={getPath(svg)} fill={brandColors[key]} />
    </svg>
  );
}
