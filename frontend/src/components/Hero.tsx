import { HashLink } from "react-router-hash-link";
import { useSite } from "../site/useSite";

export default function Hero() {
  const { site } = useSite();
  const { hero, sections } = site.settings;
  const about = site.about;
  const firstSection = sections.find((s) => s.visible);

  return (
    <section className="relative flex min-h-[100svh] flex-col px-[max(20px,6vw)] pt-28 pb-6">
      <div className="flex max-w-3xl flex-1 flex-col justify-center gap-6 py-10">
        <div className="flex items-center gap-4">
          {hero.showPortrait && about?.profile_pic && (
            <img
              src={about.profile_pic}
              alt=""
              width={52}
              height={52}
              className="h-13 w-13 rounded-full object-cover ring-1 ring-text/20"
            />
          )}
          {hero.eyebrow && <p className="font-mono text-sm text-accent">{hero.eyebrow}</p>}
        </div>

        <h1 className="font-display text-[clamp(44px,7vw,96px)] leading-[1.02] font-light tracking-[-0.03em]">
          {hero.firstLine}
          {hero.secondLine && (
            <>
              <br />
              {hero.secondLine}
            </>
          )}
          <span className="text-accent">.</span>
        </h1>

        {hero.intro && (
          <p className="max-w-[46ch] text-lg leading-relaxed font-light text-text/80">{hero.intro}</p>
        )}

        {hero.status && (
          <p className="flex items-center gap-3 text-sm text-text/70">
            <span className="h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden="true" />
            {hero.status}
          </p>
        )}
      </div>

      {hero.readout.length > 0 && (
        <div className="absolute right-[max(20px,6vw)] bottom-24 hidden text-right font-mono text-xs leading-relaxed text-muted md:block">
          {hero.readout.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-text/15 pt-5 text-sm text-muted">
        <p>
          {hero.footer.map((part, i) => (
            <span key={part}>
              {i > 0 && <span className="mx-3 text-accent" aria-hidden="true">/</span>}
              {part}
            </span>
          ))}
        </p>
        {firstSection && (
          <HashLink smooth to={`/#${firstSection.id}`} className="arrow-link down text-muted">
            Scroll down <span className="arrow">↓</span>
          </HashLink>
        )}
      </div>
    </section>
  );
}
