"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Podcast } from "@/content/podcasts";

/* Both queries are read at the moment they matter rather than cached in
   state, so a visitor who plugs in a mouse or changes their motion setting
   gets the right behaviour without the card re-rendering. */
const isTouch = () => window.matchMedia("(pointer: coarse)").matches;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Park a teaser back on its chosen still rather than on frame zero. */
function restAt(vid: HTMLVideoElement | null, seconds: number) {
  if (!vid) return;
  vid.pause();
  /* Seeking past the end of a finished clip is a no-op in some browsers,
     so wrap defensively rather than trusting duration. */
  if (Number.isFinite(seconds)) vid.currentTime = seconds;
}

/**
 * Vertical (9:16) podcast teaser card.
 *
 * The card is a button, not a link: episodes have no pages of their own, so
 * clicking one opens the episode overlay over whichever page it sits on.
 *
 * Teaser playback rules live here rather than in either parent:
 *
 *  · pointer devices — the clip plays on hover/focus and rewinds on leave, so
 *    a desktop visitor never has four videos running at once;
 *  · touch devices — there is no hover, so the card plays while it is the
 *    thing on screen and pauses the moment it scrolls away;
 *  · reduced motion — nothing autoplays; the poster frame is the whole card.
 *
 * The clip is decoration. Everything the card says is in the markup.
 */
export function PodcastCard({
  podcast,
  onSelect,
}: {
  podcast: Podcast;
  onSelect: (podcast: Podcast) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /* The observer watches the media box, not the outer element, so the same
     hook works whether the card renders as a button or as a link. */
  const mediaRef = useRef<HTMLDivElement>(null);

  /* The frame the card rests on — both before the first hover and after
     every one, so a card never settles on a frame nobody chose. */
  const posterTime = podcast.posterTime ?? 0.1;

  /* Some shorts arrive padded to 9:16 with black bars baked into the frame.
     Scaling the clip pushes that padding outside the card. 1 = untouched. */
  const zoom = podcast.zoom ?? 1;

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        /* Hover owns playback wherever there is a pointer to hover with. */
        if (!isTouch() || prefersReducedMotion()) {
          restAt(vid, posterTime);
          return;
        }
        if (entry.isIntersecting) vid.play().catch(() => {});
        else restAt(vid, posterTime);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [posterTime]);

  function play() {
    if (isTouch() || prefersReducedMotion()) return;
    videoRef.current?.play().catch(() => {});
  }

  function stop() {
    if (isTouch()) return; /* the observer owns playback on touch */
    restAt(videoRef.current, posterTime);
  }

  const episodeLabel = `Ep ${String(podcast.episode).padStart(2, "0")}`;

  const inner: ReactNode = (
    <div className="pod-card-media" ref={mediaRef}>
      {podcast.teaser ? (
        <video
          ref={videoRef}
          /* The media fragment makes the browser decode and hold a single
             frame, so an idle card is never an empty black box. Which frame
             is per-episode — see posterTime in content/podcasts.ts. */
          src={`${podcast.teaser}#t=${posterTime}`}
          poster={podcast.poster || undefined}
          className="pod-card-video"
          style={zoom === 1 ? undefined : { transform: `scale(${zoom})` }}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : podcast.poster ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={podcast.poster} alt="" aria-hidden="true" className="pod-card-video" />
      ) : (
        /* No short for this episode — a branded panel, not a broken frame. */
        <div className="pod-card-fallback" aria-hidden="true">
          <span>{String(podcast.episode).padStart(2, "0")}</span>
        </div>
      )}

      <div className="pod-card-scrim" aria-hidden="true" />

      <span className="pod-card-ep">{episodeLabel}</span>

      <span className="pod-card-play" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>

      <div className="pod-card-body">
        <p className="pod-card-guest">{podcast.guest}</p>
        <h3 className="v2-card-title pod-card-title">{podcast.title}</h3>
        <p className="pod-card-blurb">{podcast.blurb}</p>
        <p className="pod-card-meta">
          <span>{podcast.duration}</span>
          <span className="pod-card-cue">
            Watch <span aria-hidden="true">→</span>
          </span>
        </p>
      </div>
    </div>
  );

  const handlers = {
    onMouseEnter: play,
    onMouseLeave: stop,
    onFocus: play,
    onBlur: stop,
  };

  return (
    <button
      type="button"
      className="pod-card"
      data-podcast-slug={podcast.slug}
      onClick={() => onSelect(podcast)}
      {...handlers}
    >
      {inner}
    </button>
  );
}
