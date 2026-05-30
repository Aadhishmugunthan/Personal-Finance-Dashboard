// ============================================================
// LEARN: React Context — the right tool when you need to share
// state across many components without "prop drilling" (passing
// props through every level of the tree).
//
// Theme is a perfect use case: the toggle is in the Sidebar,
// but the theme affects the entire app. Without Context you'd
// have to pass `theme` and `setTheme` through App → Sidebar,
// App → every page → every chart. With Context, any component
// can just call useTheme() and get what it needs.
//
// The pattern:
//   1. createContext()       — creates the context object
//   2. <Context.Provider>   — wraps the tree, provides the value
//   3. useContext(Context)  — any child reads the value
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

// Step 1: Create the context with a sensible default
// The default only matters if a component is used outside a Provider
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

// Step 2: Provider component — wraps the whole app in App.jsx
export const ThemeProvider = ({ children }) => {
  // LEARN: localStorage lets us persist the theme across page reloads.
  // We read the saved value on first render, falling back to "dark".
  const [theme, setTheme] = useState(
    () => localStorage.getItem("financeiq-theme") || "dark"
  );

  // LEARN: useEffect syncs the theme to the DOM and localStorage
  // whenever `theme` changes. We set a data-theme attribute on
  // <html> so CSS can target [data-theme="light"] selectors.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("financeiq-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Step 3: Custom hook — cleaner than calling useContext directly
// Usage: const { theme, toggleTheme } = useTheme();
export const useTheme = () => useContext(ThemeContext);
