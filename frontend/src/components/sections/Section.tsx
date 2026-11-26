import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  /** Something shown under the title in the left column (e.g. a skip button). */
  aside?: ReactNode;
  /** Use the full width under the title instead of the right column. */
  wide?: boolean;
}

// The frame every homepage section shares: the title in a narrow left
// column that stays put while you scroll, the content in a wide right column.
// `wide` sections break out of that on purpose (used for projects).
export default function Section({ id, title, intro, children, aside, wide = false }: Props) {
  if (wide) {
    return (
      <section id={id} className="grid gap-12 border-t border-text/10 px-[max(20px,6vw)] py-20 md:py-28">
        <div className="grid gap-x-16 gap-y-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:items-end">
          <h2 className="font-display text-2xl font-light tracking-[-0.02em] md:text-3xl">{title}</h2>
          <div className="flex flex-wrap items-end justify-between gap-4">
            {intro && <p className="max-w-[52ch] text-sm leading-relaxed text-muted">{intro}</p>}
            {aside}
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="grid gap-x-16 gap-y-8 border-t border-text/10 px-[max(20px,6vw)] py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:py-28"
    >
      <div className="md:sticky md:top-28 md:self-start">
        <h2 className="font-display text-2xl font-light tracking-[-0.02em] md:text-3xl">{title}</h2>
        {intro && <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted">{intro}</p>}
        {aside && <div className="mt-6">{aside}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
