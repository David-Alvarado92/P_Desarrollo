import React from "react";
import { createRoot } from "react-dom/client";
import ScoreboardApp from "./ScoreboardApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScoreboardApp />
  </React.StrictMode>
);
