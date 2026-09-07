import type { ReactNode } from "react";

/**
 * The dark banner that opens an inner content page (/podcast, /blog,
 * /gallery).
 *
 * All three pages previously hand-rolled this block and had drifted apart:
 * two different containers, three radial-glow opacities, two lead widths
 * and two title weights. Everything structural now lives here and in the
 * .v2-page-hero-* rules; a page supplies only its words, image and tint.
 */
export type PageHeroProps = {
  /** Small gold label above the title. */
  eyebrow: ReactNode;
  title: ReactNode;
  /** Standfirst under the title. Omit for a title-only hero. */
  lead?: ReactNode;
  /** Decorative background image; it is never announced to screen readers. */
  image?: string;
  /**
   * Scrim colour behind the copy. "dark" is --dark (forest-950); "earth" is
   * the warm editorial tint used by the Wellness Journal and gallery, a
   * deliberate counterpoint to the cool forest bands.
   */
  tint?: "dark" | "earth";
  /** Adds the bottom vignette that lifts copy off a busy photograph. */
  vignette?: boolean;
  /** Plays the entrance reveal (above-the-fold pages only). */
  reveal?: boolean;
  /** Container helper; pages with a narrower measure can override. */
  containerClassName?: string;
};

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  tint = "dark",
  vignette = false,
  reveal = false,
  containerClassName = "v2-container",
}: PageHeroProps) {
  const r = (n: number) => (reveal ? ` v2-reveal v2-reveal-${n}` : "");

  return (
    <section className={`v2-page-hero v2-page-hero-${tint}`}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" aria-hidden="true" className="v2-page-hero-img" />
      )}
      <div className="v2-page-hero-scrim" />
      <div className="v2-page-hero-glow" />
      {vignette && <div className="v2-page-hero-vignette" />}

      <div className={`${containerClassName} v2-page-hero-body`}>
        <p className={`v2-section-label v2-section-label-light mb-4${reveal ? " v2-reveal" : ""}`}>
          {eyebrow}
        </p>
        <h1 className={`v2-page-hero-title${r(1)}`}>{title}</h1>
        {lead && <p className={`v2-page-hero-lead${r(2)}`}>{lead}</p>}
      </div>
    </section>
  );
}
