import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import { ToolPage, ToolsIndex } from "./pages/Tools";
import { SiteProvider } from "./site/SiteContext";

// When you go to a new page, start at the top (unless the link points to
// a section like /#contact, which HashLink scrolls to itself).
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// Which component to show for which URL.
export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tools" element={<ToolsIndex />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          {/* Old addresses that might still be linked somewhere */}
          <Route path="/archive" element={<Navigate to="/projects" replace />} />
          <Route path="/life" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
