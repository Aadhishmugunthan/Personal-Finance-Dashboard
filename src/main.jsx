// ============================================================
// LEARN: main.jsx is the entry point — it mounts the React app
// into the #root div in index.html.
//
// We wrap App in ThemeProvider here so the theme context is
// available to every component in the tree. This is the
// standard pattern: providers wrap the entire app at the root.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ThemeProvider wraps App so every component can call useTheme() */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
