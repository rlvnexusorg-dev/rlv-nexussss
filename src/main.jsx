import React from "react";
import { createRoot } from "react-dom/client";
import { domAnimation, LazyMotion } from "framer-motion";
import App from "./App.jsx";
import "./index.css";
import "./studio-theme.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LazyMotion features={domAnimation} strict>
      <App />
    </LazyMotion>
  </React.StrictMode>,
);
