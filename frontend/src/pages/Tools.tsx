import { Suspense } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../auth";
import PublicLayout from "../components/PublicLayout";
import { useSite } from "../site/useSite";
import { TOOLS } from "../tools/registry";

// /tools: the list.
export function ToolsIndex() {
  const { site } = useSite();
  const loggedIn = isLoggedIn();
  const tools = TOOLS.filter((t) => !t.adminOnly || loggedIn);

  return (
    <PublicLayout>
      <div className="px-[max(20px,6vw)] pt-36 pb-24">
        <header className="grid gap-x-16 gap-y-6 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:items-end">
          <h1 className="font-display text-4xl font-light tracking-[-0.03em] md:text-5xl">Tools</h1>
          {site.settings.toolsPageIntro && (
            <p className="max-w-[56ch] text-text/80">{site.settings.toolsPageIntro}</p>
          )}
        </header>

        {tools.length === 0 ? (
          <p className="border-t border-text/10 pt-8 text-muted">No tools yet. The first ones are on their way.</p>
        ) : (
          <ul className="grid gap-x-14 md:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.slug} className="border-t border-text/10 py-7">
                <Link to={`/tools/${tool.slug}`} className="group grid gap-2">
                  <span className="flex items-baseline justify-between gap-4 text-xl group-hover:text-accent">
                    {tool.name}
                    {tool.adminOnly && <span className="font-mono text-xs text-accent2">private</span>}
                  </span>
                  <span className="font-light text-text/80">{tool.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicLayout>
  );
}

// /tools/:slug: one tool.
export function ToolPage() {
  const { slug } = useParams(); // the :slug part of the URL
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) return <Navigate to="/tools" replace />;
  if (tool.adminOnly && !isLoggedIn()) return <Navigate to="/login" replace />;

  const ToolComponent = tool.component;
  return (
    <PublicLayout>
      <div className="px-[max(20px,6vw)] pt-36 pb-24">
        <Link to="/tools" className="arrow-link font-mono text-xs text-muted">
          <span className="arrow">←</span> All tools
        </Link>
        <h1 className="mt-6 mb-10 font-display text-3xl font-light tracking-[-0.03em]">{tool.name}</h1>
        {/* Suspense shows the fallback while the tool's code is downloading. */}
        <Suspense fallback={<p className="font-mono text-sm text-muted">Loading…</p>}>
          <ToolComponent />
        </Suspense>
      </div>
    </PublicLayout>
  );
}
