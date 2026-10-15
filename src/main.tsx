import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

// Entry point: find <div id="root"> in index.html and let React control everything inside it.
//
// <BrowserRouter> turns on client-side routing: it watches the browser URL (/users, /users/123 ...)
// and lets <Routes> in App.tsx decide which page component to show. Clicking a <Link> changes the URL
// WITHOUT a full page reload and without asking the server for a new HTML page.
//
// NOTE: we deliberately do NOT wrap <App /> in <React.StrictMode>. In development StrictMode runs every
// effect twice, which shows up as a cancelled (red) request followed by a successful one in the Network
// tab and confuses beginners. Real projects usually keep it ON - to enable it, wrap <BrowserRouter> in
// <React.StrictMode> (and import React).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>
);
