"use client";

import { Reveal } from "./reveal";
import { PodcastCard } from "./podcast-card";
import { usePodcastOverlay } from "./podcast-overlay";
import type { Podcast } from "@/content/podcasts";

/**
 * The homepage teaser row. Cards open the same episode overlay the listing
 * page uses, so a visitor never leaves the page to watch an episode —
 * "Explore All Episodes" is the only route through to /podcast.
 */
export function PodcastRow({ episodes }: { episodes: Podcast[] }) {
  const { open, overlay } = usePodcastOverlay();

  return (
    <>
      {/* Scrolls sideways on narrow screens, four across on desktop. */}
      <div className="pod-row">
        {episodes.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 4) * 0.08}>
            <PodcastCard podcast={p} onSelect={open} />
          </Reveal>
        ))}
      </div>

      {overlay}
    </>
  );
}
