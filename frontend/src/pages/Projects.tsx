import { useState } from "react";
import PublicLayout from "../components/PublicLayout";
import { ProjectRow } from "../components/ProjectItem";
import { useLabels } from "../site/labels";
import { useSite } from "../site/useSite";

export default function Projects() {
  const { site, loaded } = useSite();
  const t = useLabels();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = site.projects.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tech_stack.some((t) => t.toLowerCase().includes(q)),
  );

  return (
    <PublicLayout>
      <div className="px-[max(20px,6vw)] pt-36 pb-24">
        <header className="grid gap-x-16 gap-y-6 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:items-end">
          <h1 className="font-display text-4xl font-light tracking-[-0.03em] md:text-5xl">{t("projectsTitle")}</h1>
          <div className="grid gap-6">
            {site.settings.projectsPageIntro && (
              <p className="max-w-[56ch] text-text/80">{site.settings.projectsPageIntro}</p>
            )}
            <label className="grid max-w-md gap-1">
              <span className="font-mono text-xs text-muted">{t("searchLabel")}</span>
              <input
                id="project-search"
                type="search"
                className="field"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
        </header>

        <div className="grid gap-x-14 md:grid-cols-2">
          {matches.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </div>

        {loaded && matches.length === 0 && (
          <p className="border-t border-text/10 pt-8 text-muted">
            {t("noMatches", { query })}
          </p>
        )}
      </div>
    </PublicLayout>
  );
}
