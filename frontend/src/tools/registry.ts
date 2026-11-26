import type { ComponentType, LazyExoticComponent } from "react";

// The list of tools shown on /tools. Each tool lives at /tools/<slug>.
//
// To add one:
//   1. Make a folder, e.g. src/tools/beam-calculator/, with an index.tsx
//      that has `export default function BeamCalculator() { ... }`.
//   2. Add `import { lazy } from "react";` at the top and an entry below.
//      `lazy(() => import(...))` means the tool's code
//      is only downloaded when someone opens it, so a big tool (like a PDF
//      editor) doesn't slow down the rest of the site.
//
// About `adminOnly`: it hides the tool from visitors, but the JavaScript
// is still public (anyone can download the site's code). That's fine for
// tools that are just personal. Anything that must stay secret, or uses a
// private API key, has to run on the backend behind get_current_user.

export interface Tool {
  slug: string;
  name: string;
  description: string;
  adminOnly: boolean;
  component: LazyExoticComponent<ComponentType>;
}

export const TOOLS: Tool[] = [
  // Example:
  // {
  //   slug: "beam-calculator",
  //   name: "Beam deflection",
  //   description: "Deflection and stress for simply supported beams.",
  //   adminOnly: false,
  //   component: lazy(() => import("./beam-calculator")),
  // },
];
