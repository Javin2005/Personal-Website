import { useState } from "react";
import type { FormEvent } from "react";
import { API_URL } from "../../auth";
import { useLabels } from "../../site/labels";
import { useSite } from "../../site/useSite";
import type { SectionSettings } from "../../types";
import Section from "./Section";

type Status = "idle" | "sending" | "sent" | "error" | "rate-limited";

export default function ContactSection({ section }: { section: SectionSettings }) {
  const { site } = useSite();
  const t = useLabels();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop the browser from reloading the page
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus(res.status === 429 ? "rate-limited" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  const email = site.settings.contactEmail;
  const socials = site.about?.socials ?? [];

  const aside = (email || socials.length > 0) && (
    <ul className="grid gap-2 text-sm">
      {email && (
        <li>
          <a href={`mailto:${email}`} className="arrow-link">
            {email} <span className="arrow text-accent">↗</span>
          </a>
        </li>
      )}
      {socials.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noreferrer" className="arrow-link">
            {link.platform} <span className="arrow text-accent">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <Section id={section.id} title={section.title} intro={section.intro} aside={aside}>
      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="font-mono text-xs text-muted">{t("formName")}</span>
            <input
              id="contact-name"
              required
              maxLength={100}
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="grid gap-1">
            <span className="font-mono text-xs text-muted">{t("formEmail")}</span>
            <input
              id="contact-email"
              required
              type="email"
              className="field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="font-mono text-xs text-muted">{t("formMessage")}</span>
          <textarea
            id="contact-message"
            required
            maxLength={5000}
            rows={5}
            className="field resize-y"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="submit"
            disabled={status === "sending"}
            className="arrow-link cursor-pointer border border-text/25 px-6 py-3 hover:border-accent disabled:cursor-wait disabled:opacity-50"
          >
            {status === "sending" ? t("formSending") : t("formSend")} <span className="arrow text-accent">→</span>
          </button>
          <p className="text-sm" role="status">
            {status === "sent" && <span className="text-accent2">{t("formSent")}</span>}
            {status === "error" && <span className="text-accent">{t("formError")}</span>}
            {status === "rate-limited" && (
              <span className="text-accent">{t("formRateLimited")}</span>
            )}
          </p>
        </div>
      </form>
    </Section>
  );
}
