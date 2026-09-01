"use client";

import { PodcastCard } from "./podcast-card";
import { usePodcastOverlay } from "./podcast-overlay";
import type { Podcast } from "@/content/podcasts";

/** The /podcast episode grid. Cards open the episode overlay in place. */
export function PodcastListing({ episodes }: { episodes: Podcast[] }) {
  const { open, overlay } = usePodcastOverlay();

  return (
    <>
      <p className="pod-count">
        {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
      </p>

      <div className="pod-grid pod-grid--light">
        {episodes.map((p) => (
          <PodcastCard key={p.slug} podcast={p} onSelect={open} />
        ))}
      </div>

      {overlay}
    </>
  );
}
