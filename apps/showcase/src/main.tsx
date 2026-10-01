import "@openedu/tokens/tokens.css";
import "@openedu/tokens/surfaces.css";
import "@phosphor-icons/web/regular";
import "@openedu/react";
import "./showcase.css";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
