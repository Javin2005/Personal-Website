import { useLabels } from "../../site/labels";
import { useSite } from "../../site/useSite";
import type { SectionSettings } from "../../types";
import Section from "./Section";

export default function EducationSection({ section }: { section: SectionSettings }) {
  const { site } = useSite();
  const t = useLabels();
  if (site.education.length === 0) return null;

  return (
    <Section id={section.id} title={section.title} intro={section.intro}>
      <div className="grid gap-14">
        {site.education.map((school) => (
          <article key={school.id} className="grid gap-x-8 gap-y-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <p className="font-mono text-xs leading-6 text-muted">
              {school.period}
              {school.location && (
                <>
                  <br />
                  {school.location}
                </>
              )}
            </p>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg leading-snug">{school.school}</h3>
                <p className="text-muted">{school.programme}</p>
              </div>
              {school.notes && <p className="max-w-[62ch] font-light text-text/80">{school.notes}</p>}
              {school.courses.length > 0 && (
                <div className="grid gap-3 pt-2">
                  <p className="font-mono text-xs tracking-[0.06em] text-muted uppercase">{t("completedCourses")}</p>
                  <ul className="grid gap-x-8 gap-y-1.5 text-sm text-text/85 sm:grid-cols-2">
                    {school.courses.map((course) => (
                      <li key={course}>{course}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
