import type { ReactNode } from "react";
import { FONTS } from "../site/theme";
import type { NavLink, SectionSettings, Settings, Theme } from "../types";
import { Button, ColorField, LinesField, MediaField, NumberField, SelectField, TextArea, TextField, Toggle } from "./fields";

// The settings tabs all edit one shared draft (owned by Admin.tsx) and
// are saved together with the "Save changes" bar.
interface TabProps {
  draft: Settings;
  setDraft: (s: Settings) => void;
}

const COLOR_FIELDS: { key: keyof Theme; label: string; hint: string }[] = [
  { key: "bg", label: "Background", hint: "The page itself." },
  { key: "surface", label: "Surface", hint: "Boxes that sit on the page, like the login card." },
  { key: "text", label: "Text", hint: "Main text. Lighter shades are made from this." },
  { key: "muted", label: "Muted text", hint: "Dates, labels, small print." },
  { key: "accent", label: "Accent", hint: "Links, hover, the dot after your name." },
  { key: "accent2", label: "Second accent", hint: "Used rarely: tags, status dot." },
];

export function AppearanceTab({ draft, setDraft }: TabProps) {
  const setTheme = (patch: Partial<Theme>) => setDraft({ ...draft, theme: { ...draft.theme, ...patch } });
  const setVideo = (patch: Partial<Settings["video"]>) => setDraft({ ...draft, video: { ...draft.video, ...patch } });
  const fonts = Object.keys(FONTS);

  return (
    <div className="grid gap-10">
      <Group title="Colors" note="Changes show up immediately on this page as a preview. Visitors see them after you save.">
        <div className="grid gap-5 sm:grid-cols-2">
          {COLOR_FIELDS.map((c) => (
            <ColorField
              key={c.key}
              label={c.label}
              hint={c.hint}
              value={draft.theme[c.key]}
              onChange={(v) => setTheme({ [c.key]: v })}
            />
          ))}
        </div>
      </Group>

      <Group title="Fonts">
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField label="Headings" value={draft.theme.fontDisplay} options={fonts} onChange={(v) => setTheme({ fontDisplay: v })} />
          <SelectField label="Body text" value={draft.theme.fontBody} options={fonts} onChange={(v) => setTheme({ fontBody: v })} />
          <SelectField label="Labels and code" value={draft.theme.fontMono} options={fonts} onChange={(v) => setTheme({ fontMono: v })} />
        </div>
        <p className="font-display text-3xl font-light">Christian J. Carlson<span className="text-accent">.</span></p>
        <p className="max-w-[60ch]">The quick brown fox jumps over the lazy dog. Body text looks like this.</p>
        <p className="font-mono text-xs text-muted">Summer 2026 · C++ / raylib</p>
      </Group>

      <Group title="Background video">
        <Toggle label="Show the background video" checked={draft.video.enabled} onChange={(v) => setVideo({ enabled: v })} />
        <MediaField
          label="Video"
          value={draft.video.src}
          accept="video/mp4,video/webm"
          hint="Default: /assets/blackhole.mp4. Upload a new .mp4 or .webm to replace it."
          onChange={(v) => setVideo({ src: v ?? "/assets/blackhole.mp4" })}
        />
        <NumberField
          label="Brightness (0 to 1)"
          min={0}
          max={1}
          step={0.05}
          value={draft.video.opacity}
          onChange={(v) => setVideo({ opacity: Math.min(1, Math.max(0, v)) })}
        />
        <Toggle
          label="Dim the video as you scroll down the homepage"
          checked={draft.video.dimOnScroll}
          onChange={(v) => setVideo({ dimOnScroll: v })}
        />
      </Group>
    </div>
  );
}

export function HeroTab({ draft, setDraft }: TabProps) {
  const hero = draft.hero;
  const set = (patch: Partial<Settings["hero"]>) => setDraft({ ...draft, hero: { ...hero, ...patch } });

  return (
    <div className="grid gap-10">
      <Group title="Name and intro">
        <TextField label="Small line above the name" value={hero.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Name, first line" value={hero.firstLine} onChange={(v) => set({ firstLine: v })} />
          <TextField label="Name, second line" value={hero.secondLine} onChange={(v) => set({ secondLine: v })} />
        </div>
        <TextArea label="Intro" value={hero.intro} onChange={(v) => set({ intro: v })} rows={3} />
        <TextField
          label="Status line"
          hint="A short 'what I'm doing right now' line. Leave empty to hide it."
          value={hero.status}
          onChange={(v) => set({ status: v })}
        />
        <Toggle label="Show my profile picture next to the small line" checked={hero.showPortrait} onChange={(v) => set({ showPortrait: v })} />
      </Group>
      <Group title="Details">
        <LinesField label="Footer of the hero" hint="One part per line; shown with slashes between them." value={hero.footer} onChange={(v) => set({ footer: v })} />
        <LinesField label="Readout in the corner" hint="Small technical text, bottom right. Up to 4 lines. Empty hides it." value={hero.readout} onChange={(v) => set({ readout: v })} />
      </Group>
    </div>
  );
}

const SECTION_NAMES: Record<SectionSettings["id"], string> = {
  about: "About (bio, skills, links)",
  interests: "Interests (books, films, music)",
  experience: "Experience",
  education: "Education",
  projects: "Featured projects",
  contact: "Contact form",
};

export function LayoutTab({ draft, setDraft }: TabProps) {
  const sections = draft.sections;
  const setSection = (i: number, patch: Partial<SectionSettings>) =>
    setDraft({ ...draft, sections: sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setDraft({ ...draft, sections: next });
  };

  const nav = draft.nav;
  const setNav = (next: NavLink[]) => setDraft({ ...draft, nav: next });

  return (
    <div className="grid gap-10">
      <Group title="Homepage sections" note="Order, titles and visibility. The content of each section is edited in its own tab.">
        <ol className="grid gap-4">
          {sections.map((s, i) => (
            <li key={s.id} className="grid gap-4 border border-text/10 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1 font-mono text-xs text-muted">{SECTION_NAMES[s.id]}</span>
                <Button onClick={() => moveSection(i, -1)} disabled={i === 0}>↑</Button>
                <Button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}>↓</Button>
              </div>
              <Toggle label="Show on the homepage" checked={s.visible} onChange={(v) => setSection(i, { visible: v })} />
              <TextField label="Title" value={s.title} onChange={(v) => setSection(i, { title: v })} />
              <TextArea label="Short intro under the title (optional)" value={s.intro} rows={2} onChange={(v) => setSection(i, { intro: v })} />
            </li>
          ))}
        </ol>
      </Group>

      <Group title="Menu links" note="Use /page for pages, /#section for homepage sections, or a full https:// link.">
        <ol className="grid gap-3">
          {nav.map((link, i) => (
            <li key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <TextField label="Label" value={link.label} onChange={(v) => setNav(nav.map((l, j) => (j === i ? { ...l, label: v } : l)))} />
              <TextField label="Goes to" value={link.href} onChange={(v) => setNav(nav.map((l, j) => (j === i ? { ...l, href: v } : l)))} />
              <Button variant="danger" onClick={() => setNav(nav.filter((_, j) => j !== i))}>Remove</Button>
            </li>
          ))}
        </ol>
        <div>
          <Button onClick={() => setNav([...nav, { label: "New link", href: "/" }])}>Add link</Button>
        </div>
      </Group>

      <Group title="Other text">
        <TextField
          label="Email shown in the contact section"
          hint="Leave empty to only show the form."
          value={draft.contactEmail}
          onChange={(v) => setDraft({ ...draft, contactEmail: v })}
        />
        <TextArea label="Projects page intro" rows={2} value={draft.projectsPageIntro} onChange={(v) => setDraft({ ...draft, projectsPageIntro: v })} />
        <TextArea label="Tools page intro" rows={2} value={draft.toolsPageIntro} onChange={(v) => setDraft({ ...draft, toolsPageIntro: v })} />
        <TextField label="Footer note" value={draft.footerNote} onChange={(v) => setDraft({ ...draft, footerNote: v })} />
        <Toggle
          label="Show latest GitHub commit and Spotify song in the footer"
          checked={draft.showStatus}
          onChange={(v) => setDraft({ ...draft, showStatus: v })}
        />
      </Group>
    </div>
  );
}

export function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-1 border-b border-text/10 pb-2">
        <h3 className="font-display text-lg font-light">{title}</h3>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}
