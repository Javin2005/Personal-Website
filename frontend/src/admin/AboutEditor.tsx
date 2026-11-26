import { useEffect, useState } from "react";
import { API_URL, sendJson } from "../auth";
import { useSite } from "../site/useSite";
import type { About } from "../types";
import { Button, MediaField, TextArea, TextField } from "./fields";
import { Group } from "./SettingsEditors";

export default function AboutEditor() {
  const { reload } = useSite();
  const [about, setAbout] = useState<About | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/about`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) =>
        setAbout(data ?? { name: "", title: "", bio: "", profile_pic: "", skills: [], socials: [] }),
      )
      .catch(() => setMessage("Couldn't load your profile."));
  }, []);

  if (!about) return <p className="text-sm text-muted">{message || "Loading…"}</p>;

  const save = async () => {
    try {
      await sendJson("/api/about", "PUT", about);
      setMessage("Saved.");
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't save");
    }
  };

  const socials = about.socials;
  const setSocials = (next: About["socials"]) => setAbout({ ...about, socials: next });

  return (
    <div className="grid gap-10">
      <header className="grid gap-1">
        <h2 className="font-display text-2xl font-light">About</h2>
        <p className="text-sm text-muted">Your name, bio, photo and links. Skills have their own tab.</p>
      </header>

      <Group title="Profile">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" value={about.name} onChange={(v) => setAbout({ ...about, name: v })} />
          <TextField label="Short title" value={about.title} onChange={(v) => setAbout({ ...about, title: v })} />
        </div>
        <TextArea
          label="Bio"
          hint="Leave an empty line between paragraphs."
          rows={10}
          value={about.bio}
          onChange={(v) => setAbout({ ...about, bio: v })}
        />
        <MediaField
          label="Profile picture"
          accept="image/*"
          hint="Upload a photo, or use a path like /assets/profile.jpg."
          value={about.profile_pic}
          onChange={(v) => setAbout({ ...about, profile_pic: v ?? "" })}
        />
        {about.profile_pic && (
          <img src={about.profile_pic} alt="" className="h-24 w-24 rounded-full object-cover ring-1 ring-text/20" />
        )}
      </Group>

      <Group title="Links" note="Shown in the about and contact sections.">
        <ol className="grid gap-3">
          {socials.map((link, i) => (
            <li key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <TextField
                label="Name"
                value={link.platform}
                onChange={(v) => setSocials(socials.map((s, j) => (j === i ? { ...s, platform: v } : s)))}
              />
              <TextField
                label="URL"
                value={link.url}
                onChange={(v) => setSocials(socials.map((s, j) => (j === i ? { ...s, url: v } : s)))}
              />
              <Button variant="danger" onClick={() => setSocials(socials.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </li>
          ))}
        </ol>
        <div>
          <Button onClick={() => setSocials([...socials, { platform: "", url: "https://" }])}>Add link</Button>
        </div>
      </Group>

      <div className="flex items-center gap-4">
        <Button variant="primary" onClick={save}>
          Save about
        </Button>
        {message && <p className="font-mono text-xs text-accent2">{message}</p>}
      </div>
    </div>
  );
}
