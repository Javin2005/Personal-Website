import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { API_URL } from "../auth";
import type { SiteData } from "../types";
import { EMPTY_SITE } from "./defaults";
import { applyTheme } from "./theme";

import { SiteContext } from "./useSite";

// "Context" lets any component read the site data without it being passed
// down through every component in between. The provider below loads the
// data once; components call useSite() (in useSite.ts) to read it.

const CACHE_KEY = "site-cache-v1";

// The free Render server sleeps when nobody has visited for a while and can
// take up to a minute to wake up. So we show the last content this browser
// saw straight away, and swap in fresh content when the server answers.
function readCache(): SiteData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteData) : null;
  } catch {
    return null;
  }
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteData>(() => readCache() ?? EMPTY_SITE);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/site`);
      if (!res.ok) throw new Error(String(res.status));
      const data: SiteData = await res.json();
      setSite(data);
      setFailed(false);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // storage full or blocked: the site still works, just without the cache
      }
    } catch {
      setFailed(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // The browser tab title and the description search engines show.
  useEffect(() => {
    const { siteTitle, siteDescription } = site.settings;
    if (siteTitle) document.title = siteTitle;
    if (siteDescription)
      document.querySelector('meta[name="description"]')?.setAttribute("content", siteDescription);
  }, [site.settings]);

  // Whenever the theme changes, push it into the CSS variables.
  useEffect(() => {
    applyTheme(site.settings.theme);
  }, [site.settings.theme]);

  return (
    <SiteContext.Provider value={{ site, loaded, failed, reload }}>
      {children}
    </SiteContext.Provider>
  );
}
