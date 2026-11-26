import type { SiteData } from "../types";
import { DEFAULT_LABELS } from "./labels";

// What a first-time visitor sees for the split second before the backend
// answers. Copied from backend/app/default_content.py. After the first
// visit the browser keeps the real content (see SiteContext.tsx), so this
// only matters once per visitor and doesn't have to stay in sync perfectly.
export const EMPTY_SITE: SiteData = {
  settings: {
    siteTitle: "Christian J. Carlson",
    siteDescription: "",
    labels: DEFAULT_LABELS,
    theme: {
      bg: "#06070a",
      surface: "#0d0f14",
      text: "#ece7dc",
      muted: "#8d897f",
      accent: "#e8955a",
      accent2: "#8fb0d8",
      fontDisplay: "Unbounded",
      fontBody: "IBM Plex Sans",
      fontMono: "IBM Plex Mono",
    },
    video: { enabled: true, src: "/assets/blackhole.mp4", opacity: 0.75, dimOnScroll: true },
    hero: {
      eyebrow: "Computer Science & Engineering · LTH",
      firstLine: "Christian J.",
      secondLine: "Carlson",
      intro:
        "Third-year student in Lund. I like maths, algorithms and getting physics to run in real time. The black hole behind this text is one of my projects.",
      status: "",
      footer: ["Datateknik, LTH", "expected 2029", "Lund, Sweden"],
      readout: [],
      showPortrait: false,
    },
    sections: [
      { id: "about", title: "About", intro: "", visible: true },
      { id: "experience", title: "Experience", intro: "", visible: true },
      { id: "education", title: "Education", intro: "", visible: true },
      { id: "projects", title: "Projects", intro: "", visible: true },
      { id: "contact", title: "Contact", intro: "", visible: true },
    ],
    nav: [
      { label: "About", href: "/#about" },
      { label: "Experience", href: "/#experience" },
      { label: "Projects", href: "/projects" },
      { label: "Tools", href: "/tools" },
      { label: "Contact", href: "/#contact" },
    ],
    contactEmail: "",
    footerNote: "",
    showStatus: true,
    projectsPageIntro: "",
    toolsPageIntro: "",
  },
  about: null,
  skills: [],
  interests: [],
  experience: [],
  education: [],
  projects: [],
};
