import { useSite } from "./useSite";

// Every small piece of interface text, editable under Admin → Labels.
// Same keys as DEFAULT_LABELS in backend/app/default_content.py; these are
// only used if the backend hasn't answered yet.
export const DEFAULT_LABELS: Record<string, string> = {
  logo: "",
  scrollDown: "Scroll down",
  skipTo: "Skip to {next}",
  completedCourses: "Completed courses",
  allProjects: "All projects",
  code: "Code",
  live: "Live",
  formName: "Name",
  formEmail: "Email",
  formMessage: "Message",
  formSend: "Send message",
  formSending: "Sending…",
  formSent: "Thanks, your message is on its way. I'll reply by email.",
  formError: "That didn't go through. Please try again in a moment.",
  formRateLimited: "Too many messages in a short time. Please wait a minute and try again.",
  projectsTitle: "Projects",
  searchLabel: "Search",
  searchPlaceholder: "C++, FastAPI, machine learning…",
  noMatches: "Nothing matches “{query}”. Try a language, like Python or C++.",
  toolsTitle: "Tools",
  noTools: "No tools yet. The first ones are on their way.",
  allTools: "All tools",
  privateTool: "private",
  lastCommit: "last commit",
  listeningTo: "listening to",
  signIn: "sign in",
  signOut: "Sign out",
  adminLink: "Admin",
};

// Where each label shows up, for the admin page.
export const LABEL_GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: "Navigation and hero",
    keys: [
      ["logo", "Text in the top-left corner. Leave empty for your initials"],
      ["scrollDown", "Link at the bottom of the hero"],
      ["skipTo", "Skip button in the interests section. {next} = the next section's title"],
      ["adminLink", "Menu link to the admin page (only you see it)"],
      ["signOut", "Menu button to log out (only you see it)"],
    ],
  },
  {
    title: "Sections",
    keys: [
      ["completedCourses", "Heading above the course list in education"],
      ["allProjects", "Link from the homepage projects to the projects page"],
      ["code", "Link to a project's GitHub"],
      ["live", "Link to a project's live site"],
    ],
  },
  {
    title: "Contact form",
    keys: [
      ["formName", "Name field"],
      ["formEmail", "Email field"],
      ["formMessage", "Message field"],
      ["formSend", "Send button"],
      ["formSending", "Send button while sending"],
      ["formSent", "After a message was sent"],
      ["formError", "When sending failed"],
      ["formRateLimited", "When someone sends too many messages"],
    ],
  },
  {
    title: "Projects and tools pages",
    keys: [
      ["projectsTitle", "Projects page heading"],
      ["searchLabel", "Label above the search box"],
      ["searchPlaceholder", "Grey example text in the search box"],
      ["noMatches", "When a search finds nothing. {query} = what was typed"],
      ["toolsTitle", "Tools page heading"],
      ["noTools", "When there are no tools"],
      ["allTools", "Back link on a tool's page"],
      ["privateTool", "Tag on tools only you can see"],
    ],
  },
  {
    title: "Footer",
    keys: [
      ["lastCommit", "Before your latest GitHub commit"],
      ["listeningTo", "Before the song you're playing"],
      ["signIn", "Small login link"],
    ],
  },
];

// const t = useLabels();  t("skipTo", { next: "Experience" }) -> "Skip to Experience"
export function useLabels() {
  const { site } = useSite();
  const labels = site.settings.labels ?? {};
  return (key: string, vars: Record<string, string> = {}) => {
    let text = labels[key] ?? DEFAULT_LABELS[key] ?? key;
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, value);
    return text;
  };
}
