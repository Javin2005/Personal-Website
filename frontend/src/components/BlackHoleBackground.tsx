import { useEffect, useRef } from "react";
import { useSite } from "../site/useSite";

const DEFAULT_VIDEO = "/assets/blackhole.mp4";

// The black hole video behind every page.
// On the homepage it starts bright behind the hero and dims as you scroll
// down. On other pages (`alwaysDim`) it stays dim so text is easy to read.
export default function BlackHoleBackground({ alwaysDim = false }: { alwaysDim?: boolean }) {
  const { site } = useSite();
  const video = site.settings.video;
  const ref = useRef<HTMLVideoElement>(null);

  // Scroll -> the --scroll CSS variable (0 at the top, 1 after the hero).
  // The opacity and movement are then done in CSS (see the style below),
  // which is cheaper than re-rendering React on every scroll event.
  useEffect(() => {
    const root = document.documentElement.style;
    if (alwaysDim || !video.dimOnScroll) {
      root.setProperty("--scroll", alwaysDim ? "1" : "0");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
      root.setProperty("--scroll", progress.toFixed(3));
    };
    // requestAnimationFrame: at most one update per screen refresh.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [alwaysDim, video.dimOnScroll]);

  // Pause while the tab is in the background (saves battery), and don't
  // play at all for people who asked their system for less motion.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sync = () => {
      if (reduced || document.hidden) el.pause();
      else el.play().catch(() => {});
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [video.src, video.enabled]);

  if (!video.enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        ref={ref}
        key={video.src}
        src={video.src}
        poster={video.src === DEFAULT_VIDEO ? "/assets/blackhole-poster.jpg" : undefined}
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
        style={{
          opacity: `calc(${video.opacity} * (1 - 0.8 * var(--scroll)))`,
          transform: "scale(calc(1 + 0.06 * var(--scroll))) translateY(calc(-2% * var(--scroll)))",
        }}
      />
      {/* Darkens the left side, where the text is, and fades into the page color at the bottom. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg), transparent 35%), linear-gradient(90deg, color-mix(in srgb, var(--bg) 94%, transparent), color-mix(in srgb, var(--bg) 70%, transparent) 40%, color-mix(in srgb, var(--bg) 10%, transparent) 78%, transparent)",
        }}
      />
    </div>
  );
}
