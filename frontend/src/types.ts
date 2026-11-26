// TypeScript descriptions of the data the backend sends.
// They mirror backend/app/models.py and schemas.py; if you add a field
// there, add it here too so the editor can warn you about typos.

export interface Theme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}

export interface VideoSettings {
  enabled: boolean;
  src: string;
  opacity: number;
  dimOnScroll: boolean;
}

export interface HeroSettings {
  eyebrow: string;
  firstLine: string;
  secondLine: string;
  intro: string;
  status: string;
  footer: string[];
  readout: string[];
  showPortrait: boolean;
}

export type SectionId =
  | "about"
  | "interests"
  | "experience"
  | "education"
  | "projects"
  | "contact";

export interface SectionSettings {
  id: SectionId;
  title: string;
  intro: string;
  visible: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Settings {
  theme: Theme;
  video: VideoSettings;
  hero: HeroSettings;
  sections: SectionSettings[];
  nav: NavLink[];
  contactEmail: string;
  footerNote: string;
  showStatus: boolean;
  projectsPageIntro: string;
  toolsPageIntro: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface About {
  name: string;
  title: string;
  bio: string;
  profile_pic: string;
  skills: string[];
  socials: SocialLink[];
}

// Every item in an editable list has these.
export interface Ordered {
  id: number;
  sort_order: number;
  visible: boolean;
}

export interface Project extends Ordered {
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  media_url: string | null;
  featured: boolean;
  category: string;
  difficulty: number;
  period: string;
}

export interface Experience extends Ordered {
  role: string;
  organisation: string;
  location: string;
  period: string;
  summary: string;
  tags: string[];
}

export interface Education extends Ordered {
  school: string;
  programme: string;
  location: string;
  period: string;
  notes: string;
  courses: string[];
}

export interface SkillGroup extends Ordered {
  label: string;
  items: string[];
}

export interface Interest extends Ordered {
  category: string;
  title: string;
  creator: string;
  note: string;
}

// What GET /api/site returns.
export interface SiteData {
  settings: Settings;
  about: About | null;
  skills: SkillGroup[];
  interests: Interest[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}
