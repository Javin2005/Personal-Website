import { useSite } from "../../site/useSite";
import type { SectionSettings } from "../../types";
import Section from "./Section";

export default function AboutSection({ section }: { section: SectionSettings }) {
  const { site } = useSite();
  const { about, skills } = site;
  if (!about) return null;

  return (
    <Section id={section.id} title={section.title} intro={section.intro}>
      <div className="grid gap-12">
        {/* The bio is split into paragraphs on blank lines. */}
        <div className="grid max-w-[64ch] gap-5 text-lg leading-relaxed font-light text-text/85">
          {about.bio
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>

        {skills.length > 0 && (
          <dl className="grid gap-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-8">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="font-mono text-xs tracking-[0.06em] text-muted uppercase sm:pt-1">
                  {group.label}
                </dt>
                <dd className="m-0 text-text/90">{group.items.join("  ·  ")}</dd>
              </div>
            ))}
          </dl>
        )}

        {about.socials.length > 0 && (
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {about.socials.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="arrow-link">
                  {link.platform} <span className="arrow text-accent">↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
