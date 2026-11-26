import { Link } from "react-router-dom";
import { useLabels } from "../../site/labels";
import { useSite } from "../../site/useSite";
import type { SectionSettings } from "../../types";
import { ProjectRow, ProjectSpotlight } from "../ProjectItem";
import Section from "./Section";

export default function ProjectsSection({ section }: { section: SectionSettings }) {
  const { site } = useSite();
  const t = useLabels();
  const featured = site.projects.filter((p) => p.featured);
  if (featured.length === 0) return null;

  // The first featured project with a picture or video gets the big slot.
  const spotlight = featured.find((p) => p.media_url);
  const rest = featured.filter((p) => p !== spotlight);

  const allLink = (
    <Link to="/projects" className="arrow-link text-sm">
      {t("allProjects")} <span className="arrow text-accent">→</span>
    </Link>
  );

  return (
    <Section id={section.id} title={section.title} intro={section.intro} aside={allLink} wide>
      <div className="grid gap-16">
        {spotlight && <ProjectSpotlight project={spotlight} />}
        {rest.length > 0 && (
          <div className="grid gap-x-14 md:grid-cols-2">
            {rest.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
