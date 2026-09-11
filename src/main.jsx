import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/journal.css";
import "./styles/habits.css";
import "./styles/projects.css";
import "./styles/insights.css";
import "./styles/profile.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
