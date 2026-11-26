import { useEffect, useRef } from "react";
import type { Project } from "../types";

const VIDEO = /\.(mp4|webm)(\?|$)/i;

// An image or a looping video. The video only plays while it's on screen.
export function ProjectMedia({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const isVideo = VIDEO.test(src) || src.includes("/video/upload/");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver tells us when an element enters or leaves the screen.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  if (isVideo) {
    return (
      <video
        ref={ref}
        src={src}
        poster={src === "/assets/blackhole.mp4" ? "/assets/blackhole-poster.jpg" : undefined}
        preload="metadata"
        muted
        loop
        playsInline
        aria-label={`${title} demo video`}
        className="aspect-video w-full bg-surface object-cover"
      />
    );
  }
  return <img src={src} alt={title} loading="lazy" className="aspect-video w-full bg-surface object-cover" />;
}

function Links({ project }: { project: Project }) {
  if (!project.github_url && !project.live_url) return null;
  return (
    <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noreferrer" className="arrow-link">
          Code <span className="arrow text-accent">↗</span>
        </a>
      )}
      {project.live_url && (
        <a href={project.live_url} target="_blank" rel="noreferrer" className="arrow-link">
          Live <span className="arrow text-accent">↗</span>
        </a>
      )}
    </p>
  );
}

function Meta({ project }: { project: Project }) {
  const parts = [project.category, project.period].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="font-mono text-xs text-muted">{parts.join(" · ")}</p>;
}

// The big one: media on one side, text on the other.
export function ProjectSpotlight({ project }: { project: Project }) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
      {project.media_url && (
        <div className="overflow-hidden border border-text/10">
          <ProjectMedia src={project.media_url} title={project.title} />
        </div>
      )}
      <div className="grid gap-4">
        <Meta project={project} />
        <h3 className="font-display text-2xl font-light tracking-[-0.02em] md:text-[34px] md:leading-tight">
          {project.title}
        </h3>
        <p className="font-light text-text/80">{project.description}</p>
        {project.tech_stack.length > 0 && (
          <p className="font-mono text-xs text-accent2">{project.tech_stack.join(" / ")}</p>
        )}
        <Links project={project} />
      </div>
    </article>
  );
}

// A row in a list of projects.
export function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="group grid gap-3 border-t border-text/10 py-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xl leading-snug transition-colors group-hover:text-accent">{project.title}</h3>
        <Meta project={project} />
      </div>
      <p className="max-w-[70ch] font-light text-text/80">{project.description}</p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        {project.tech_stack.length > 0 ? (
          <p className="font-mono text-xs text-accent2">{project.tech_stack.join(" / ")}</p>
        ) : (
          <span />
        )}
        <Links project={project} />
      </div>
    </article>
  );
}
