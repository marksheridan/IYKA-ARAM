import Link from "next/link";
import { Reveal } from "./reveal";
import { PodcastRow } from "./podcast-row";
import { getPodcasts, podcastMeta } from "@/content/podcasts";

/* Homepage podcast row.
   Shows the four most recent episodes as vertical teasers; everything else
   lives behind "Explore all episodes" on /podcast. Content comes from
   src/content/podcasts.ts — nothing here needs editing to add an episode. */
const HOME_COUNT = 4;

export function PodcastSection() {
  const episodes = getPodcasts().slice(0, HOME_COUNT);
  if (episodes.length === 0) return null;

  return (
    <section
      id="podcast"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--dark)", position: "relative", overflow: "hidden" }}
    >
      {/* The studio frame from the podcast hero, carried through to the
          homepage band so the two read as the same show. Decorative only. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/podcast-hero.png" alt="" aria-hidden="true" className="pod-section-bg" />
      <div className="pod-section-scrim" aria-hidden="true" />

      <div className="v2-container" style={{ position: "relative" }}>
        <div className="pod-head">
          <Reveal>
            <p className="v2-section-label v2-section-label-light" style={{ marginBottom: "1rem" }}>
              {podcastMeta.showName}
            </p>
            <h2
              className="v2-section-title"
              style={{ color: "var(--cream)", maxWidth: "20ch", marginInline: "auto" }}
            >
              Conversations on
              <br />
              <em style={{ color: "var(--gold-light)" }}>drugless healthcare.</em>
            </h2>
            <p className="pod-head-text">{podcastMeta.description}</p>
          </Reveal>
        </div>

        {/* Cards open the episode overlay in place — same as the listing. */}
        <PodcastRow episodes={episodes} />

        {/* The section's one call to action, under the cards. */}
        <div className="pod-row-cta">
          <Reveal delay={0.1}>
            <Link href="/podcast" className="v2-btn v2-btn-outline-cream">
              Explore All Episodes
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
