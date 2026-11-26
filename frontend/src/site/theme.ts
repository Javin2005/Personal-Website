import type { Theme } from "../types";

// Same list as FONTS in backend/app/schemas.py: the weights to request
// from Google Fonts for each font the admin can choose.
export const FONTS: Record<string, string> = {
  Unbounded: "200..900",
  "IBM Plex Sans": "300;400;500;600",
  "IBM Plex Mono": "400;500",
  "Space Grotesk": "300..700",
  "Public Sans": "300..800",
  "JetBrains Mono": "400..700",
  "Instrument Serif": "400",
  Orbitron: "400..900",
  Oxanium: "200..800",
  Sora: "300..700",
  Manrope: "300..800",
  "DM Mono": "300;400;500",
};

const FALLBACK = {
  display: "'Segoe UI', system-ui, sans-serif",
  body: "'Segoe UI', system-ui, sans-serif",
  mono: "ui-monospace, Menlo, Consolas, monospace",
};

function fontUrl(families: string[]): string {
  const params = [...new Set(families)]
    .filter((f) => f in FONTS)
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@${FONTS[f]}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// Turns the theme from the database into CSS variables on <html>.
// Every color and font in the site reads from these variables (see
// index.css), so changing them here restyles the whole page at once.
export function applyTheme(theme: Theme) {
  const root = document.documentElement.style;
  root.setProperty("--bg", theme.bg);
  root.setProperty("--surface", theme.surface);
  root.setProperty("--text", theme.text);
  root.setProperty("--muted", theme.muted);
  root.setProperty("--accent", theme.accent);
  root.setProperty("--accent2", theme.accent2);
  root.setProperty("--font-display-family", `'${theme.fontDisplay}', ${FALLBACK.display}`);
  root.setProperty("--font-body-family", `'${theme.fontBody}', ${FALLBACK.body}`);
  root.setProperty("--font-mono-family", `'${theme.fontMono}', ${FALLBACK.mono}`);

  // Load the fonts. One <link> tag that we update, instead of adding a
  // new one every time the theme changes.
  let link = document.getElementById("theme-fonts") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "theme-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  const href = fontUrl([theme.fontDisplay, theme.fontBody, theme.fontMono]);
  if (link.href !== href) link.href = href;
}
