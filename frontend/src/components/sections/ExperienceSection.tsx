import { useSite } from "../../site/useSite";
import type { SectionSettings } from "../../types";
import Section from "./Section";

export default function ExperienceSection({ section }: { section: SectionSettings }) {
  const { site } = useSite();
  if (site.experience.length === 0) return null;

  return (
    <Section id={section.id} title={section.title} intro={section.intro}>
      <ol className="grid">
        {site.experience.map((job) => (
          <li
            key={job.id}
            className="group grid gap-x-8 gap-y-2 border-b border-text/10 py-7 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <p className="font-mono text-xs leading-6 text-muted">
              {job.period}
              {job.location && (
                <>
                  <br />
                  {job.location}
                </>
              )}
            </p>
            <div className="grid gap-3">
              <h3 className="text-lg leading-snug">
                <span className="transition-colors group-hover:text-accent">{job.role}</span>
                <span className="text-muted">, {job.organisation}</span>
              </h3>
              {job.summary && <p className="max-w-[62ch] font-light text-text/80">{job.summary}</p>}
              {job.tags.length > 0 && (
                <p className="font-mono text-xs text-accent2">{job.tags.join(" / ")}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
