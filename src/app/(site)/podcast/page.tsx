import { PageHero } from "@/components/site/page-hero";
import { PodcastListing } from "@/components/site/podcast-listing";
import { CtaSection } from "@/components/site/cta-section";
import { getPodcasts, podcastMeta } from "@/content/podcasts";

export const metadata = {
  title: podcastMeta.showName,
  description: podcastMeta.description,
};

export default function PodcastListingPage() {
  const episodes = getPodcasts();

  return (
    <>
      <PageHero
        eyebrow={podcastMeta.tagline}
        title={podcastMeta.showName}
        lead={podcastMeta.description}
        image="/podcast-hero.png"
        tint="dark"
      />

      {/* Episode grid */}
      <section
        className="v2-landing"
        style={{ background: "var(--cream-deep)", paddingBlock: "clamp(3.5rem, 8vw, 6rem)" }}
      >
        <div className="v2-container">
          {episodes.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--dark-soft)" }}>
              The first episode is on its way.
            </p>
          ) : (
            /* Episodes have no page of their own — the card opens the full
               conversation in an overlay over this grid. */
            <PodcastListing episodes={episodes} />
          )}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
