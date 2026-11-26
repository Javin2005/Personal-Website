import { HashLink } from "react-router-hash-link";
import { useLabels } from "../../site/labels";
import { useSite } from "../../site/useSite";
import type { Interest, SectionSettings } from "../../types";
import Section from "./Section";

export default function InterestsSection({
  section,
  next,
}: {
  section: SectionSettings;
  next?: SectionSettings; // the section after this one, for the skip button
}) {
  const { site } = useSite();
  const t = useLabels();
  if (site.interests.length === 0) return null;

  // Group the items by category, keeping the order they were added in:
  // { Books: [...], Films: [...] }
  const groups = new Map<string, Interest[]>();
  for (const item of site.interests) {
    groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  }

  const skip = next && (
    <HashLink smooth to={`/#${next.id}`} className="arrow-link down font-mono text-xs text-muted">
      {t("skipTo", { next: next.title.toLowerCase() })} <span className="arrow">↓</span>
    </HashLink>
  );

  return (
    <Section id={section.id} title={section.title} intro={section.intro} aside={skip}>
      <div className="grid gap-12 sm:grid-cols-2">
        {[...groups.entries()].map(([category, items]) => (
          <div key={category} className="grid content-start gap-4">
            <h3 className="font-mono text-xs tracking-[0.06em] text-muted uppercase">{category}</h3>
            <ul className="grid gap-4">
              {items.map((item) => (
                <li key={item.id}>
                  <p>
                    {item.title}
                    {item.creator && <span className="text-muted">, {item.creator}</span>}
                  </p>
                  {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
