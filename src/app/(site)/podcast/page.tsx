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
      {/* Hero — same shape as the Wellness Journal hero so the two content
          sections of the site read as a pair. */}
      <section
        className="relative flex min-h-[42vh] items-end overflow-hidden"
        style={{ background: "var(--dark)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/podcast-hero.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full object-cover"
          style={{ width: "62%", objectPosition: "72% center", opacity: 0.6 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #1B1916 38%, rgba(27,25,22,0.82) 60%, rgba(27,25,22,0) 82%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 100%, rgba(200,151,60,0.10), transparent),radial-gradient(ellipse 50% 80% at 0% 0%, rgba(200,151,60,0.07), transparent)",
          }}
        />
        <div className="v2-container relative pb-16 pt-40">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-light)" }}
          >
            {podcastMeta.tagline}
          </p>
          <h1
            className="font-display font-light leading-[1.05]"
            style={{ fontSize: "clamp(3rem,7vw,5.5rem)", color: "var(--cream)" }}
          >
            {podcastMeta.showName}
          </h1>
          <p
            className="mt-4 max-w-[34rem] font-light leading-[1.7]"
            style={{ fontSize: "1.05rem", color: "rgba(248,244,238,0.65)" }}
          >
            {podcastMeta.description}
          </p>
        </div>
      </section>

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
