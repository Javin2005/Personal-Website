import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AboutEditor from "../admin/AboutEditor";
import ApiKeysEditor from "../admin/ApiKeysEditor";
import CollectionEditor from "../admin/CollectionEditor";
import { Button } from "../admin/fields";
import { AppearanceTab, HeroTab, LabelsTab, LayoutTab } from "../admin/SettingsEditors";
import { API_URL, isLoggedIn, logout, sendJson } from "../auth";
import { useSite } from "../site/useSite";
import { applyTheme } from "../site/theme";
import type { Education, Experience, Interest, Project, Settings, SkillGroup } from "../types";

const TABS = [
  { id: "appearance", label: "Appearance", group: "Settings" },
  { id: "hero", label: "Hero", group: "Settings" },
  { id: "layout", label: "Sections & menu", group: "Settings" },
  { id: "labels", label: "Labels", group: "Settings" },
  { id: "about", label: "About", group: "Content" },
  { id: "skills", label: "Skills", group: "Content" },
  { id: "experience", label: "Experience", group: "Content" },
  { id: "education", label: "Education", group: "Content" },
  { id: "projects", label: "Projects", group: "Content" },
  { id: "interests", label: "Interests", group: "Content" },
  { id: "apikeys", label: "API keys", group: "Access" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const SETTINGS_TABS: TabId[] = ["appearance", "hero", "layout", "labels"];

export default function Admin() {
  const navigate = useNavigate();
  const { site, reload } = useSite();
  const [tab, setTab] = useState<TabId>("appearance");

  // The settings being edited. They only reach the database when you press Save.
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saved, setSaved] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [resetKey, setResetKey] = useState(0); // bumping this remounts the forms

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data: Settings) => {
        setDraft(data);
        setSaved(data);
      })
      .catch(() => setMessage("Couldn't load the settings. The server may be waking up; reload in a minute."));
  }, [navigate]);

  // Live preview: show the draft colors and fonts while editing, and put
  // the saved ones back when leaving the admin page.
  useEffect(() => {
    if (draft) applyTheme(draft.theme);
  }, [draft]);
  useEffect(() => () => applyTheme(site.settings.theme), [site.settings.theme]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const saveSettings = async () => {
    if (!draft) return;
    try {
      const result = await sendJson<Settings>("/api/settings", "PUT", draft);
      setSaved(result);
      setDraft(result);
      setMessage("Saved. The site is updated.");
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't save");
    }
  };

  const discard = () => {
    setDraft(saved);
    setResetKey((k) => k + 1);
    setMessage("Changes discarded.");
  };

  const resetToDefaults = async () => {
    try {
      const defaults = await sendJson<Settings>("/api/settings/defaults", "GET");
      setDraft(defaults);
      setResetKey((k) => k + 1);
      setMessage("Default settings loaded. Press Save to keep them.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't load defaults");
    }
  };

  const isSettingsTab = SETTINGS_TABS.includes(tab);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-text/10 bg-bg/90 px-[max(20px,4vw)] py-4 backdrop-blur">
        <p className="font-mono text-sm">
          <span className="text-accent">admin</span> <span className="text-muted">/ {TABS.find((t) => t.id === tab)?.label}</span>
        </p>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/" className="hover:text-accent">
            View site
          </Link>
          <button
            type="button"
            className="cursor-pointer text-muted hover:text-accent"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="grid gap-10 px-[max(20px,4vw)] py-10 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav className="md:sticky md:top-24 md:self-start">
          {["Settings", "Content", "Access"].map((group) => (
            <div key={group} className="mb-6">
              <p className="mb-2 font-mono text-xs tracking-[0.06em] text-muted uppercase">{group}</p>
              <ul className="flex flex-wrap gap-1 md:grid">
                {TABS.filter((t) => t.group === group).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`w-full cursor-pointer px-3 py-1.5 text-left text-sm transition-colors ${
                        tab === t.id ? "bg-surface text-accent" : "text-text/75 hover:text-text"
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main className="max-w-4xl min-w-0 pb-24">
          {isSettingsTab &&
            (draft ? (
              <div key={resetKey}>
                {tab === "appearance" && <AppearanceTab draft={draft} setDraft={setDraft} />}
                {tab === "hero" && <HeroTab draft={draft} setDraft={setDraft} />}
                {tab === "layout" && <LayoutTab draft={draft} setDraft={setDraft} />}
                {tab === "labels" && <LabelsTab draft={draft} setDraft={setDraft} />}
              </div>
            ) : (
              <p className="text-sm text-muted">{message || "Loading settings…"}</p>
            ))}

          {tab === "about" && <AboutEditor />}
          {tab === "apikeys" && <ApiKeysEditor />}

          {tab === "skills" && (
            <CollectionEditor<SkillGroup>
              path="skills"
              title="Skills"
              description="Groups of tools and languages, e.g. 'Use most days'. Shown in the about section."
              blank={{ label: "", items: [] }}
              label={(g) => `${g.label}: ${g.items.join(", ")}`}
              fields={[
                { key: "label", label: "Group name", type: "text" },
                { key: "items", label: "Items", type: "list" },
              ]}
            />
          )}

          {tab === "experience" && (
            <CollectionEditor<Experience>
              path="experience"
              title="Experience"
              description="Jobs, roles and volunteering, newest first."
              blank={{ role: "", organisation: "", location: "", period: "", summary: "", tags: [] }}
              label={(e) => `${e.role}, ${e.organisation}`}
              fields={[
                { key: "role", label: "Role", type: "text" },
                { key: "organisation", label: "Organisation", type: "text" },
                { key: "period", label: "When", type: "text", hint: "e.g. Summer 2026 or 2024 – 2026" },
                { key: "location", label: "Where", type: "text" },
                { key: "summary", label: "What you did", type: "textarea" },
                { key: "tags", label: "Tags", type: "list" },
              ]}
            />
          )}

          {tab === "education" && (
            <CollectionEditor<Education>
              path="education"
              title="Education"
              description="Schools and programmes, with the courses you've finished."
              blank={{ school: "", programme: "", location: "", period: "", notes: "", courses: [] }}
              label={(e) => `${e.school}, ${e.programme}`}
              fields={[
                { key: "school", label: "School", type: "text" },
                { key: "programme", label: "Programme", type: "text" },
                { key: "period", label: "When", type: "text" },
                { key: "location", label: "Where", type: "text" },
                { key: "notes", label: "Notes", type: "textarea" },
                { key: "courses", label: "Completed courses", type: "lines" },
              ]}
            />
          )}

          {tab === "projects" && (
            <CollectionEditor<Project>
              path="projects"
              title="Projects"
              description="'Featured' projects appear on the homepage; the first featured one with a picture or video gets the big slot. All visible projects are on the projects page."
              blank={{
                title: "",
                description: "",
                tech_stack: [],
                github_url: null,
                live_url: null,
                media_url: null,
                featured: false,
                category: "",
                difficulty: 3,
                period: "",
              }}
              label={(p) => `${p.title}${p.featured ? "  ★ featured" : ""}`}
              fields={[
                { key: "title", label: "Title", type: "text" },
                { key: "description", label: "Description", type: "textarea" },
                { key: "category", label: "Category", type: "text" },
                { key: "period", label: "When", type: "text" },
                { key: "tech_stack", label: "Tech", type: "list" },
                { key: "github_url", label: "GitHub link", type: "text" },
                { key: "live_url", label: "Live link", type: "text" },
                { key: "media_url", label: "Picture or video", type: "media" },
                { key: "difficulty", label: "Difficulty (1-5, only for you)", type: "number", min: 1, max: 5 },
                { key: "featured", label: "Featured on the homepage", type: "checkbox" },
              ]}
            />
          )}

          {tab === "interests" && (
            <CollectionEditor<Interest>
              path="interests"
              title="Interests"
              description="Books, films, music, anything. Grouped by category on the site. Turn the section on under Sections & menu."
              blank={{ category: "Books", title: "", creator: "", note: "" }}
              label={(i) => `${i.category}: ${i.title}`}
              fields={[
                { key: "category", label: "Category", type: "text", hint: "Items with the same category are grouped together." },
                { key: "title", label: "Title", type: "text" },
                { key: "creator", label: "By", type: "text" },
                { key: "note", label: "A line about it (optional)", type: "textarea" },
              ]}
            />
          )}
        </main>
      </div>

      {/* The save bar for settings tabs, stuck to the bottom of the screen. */}
      {isSettingsTab && draft && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-text/10 bg-surface/95 px-[max(20px,4vw)] py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted">{dirty ? "Unsaved changes" : message || "All changes saved"}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="danger" onClick={resetToDefaults}>
                Reset to defaults
              </Button>
              <Button onClick={discard} disabled={!dirty}>
                Discard
              </Button>
              <Button variant="primary" onClick={saveSettings} disabled={!dirty}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
