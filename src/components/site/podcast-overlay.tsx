"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Podcast } from "@/content/podcasts";

/**
 * The episode overlay, and the state that drives it.
 *
 * Episodes have no pages of their own — a vertical card opens the full
 * YouTube conversation over whatever page the card is on, with the write-up
 * under it. Both the homepage row and the /podcast listing call this hook,
 * so the two behave identically.
 *
 * The iframe is mounted only while the overlay is open, so a page costs
 * nothing until someone asks for a video, and closing stops playback
 * outright rather than leaving audio running behind the page.
 */
export function usePodcastOverlay(): {
  open: (podcast: Podcast) => void;
  overlay: ReactNode;
} {
  const [active, setActive] = useState<Podcast | null>(null);
  /* Where the visitor was before the overlay opened, so focus goes back to
     the card they clicked instead of the top of the document. */
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    /* Fall back to the card for the open episode: a mouse click focuses the
       button, but not every route in does, and focus must never be dumped
       back on <body>. */
    const card = active
      ? document.querySelector<HTMLElement>(`[data-podcast-slug="${active.slug}"]`)
      : null;
    const target = openerRef.current ?? card;
    setActive(null);
    openerRef.current = null;
    target?.focus();
  }, [active]);

  const open = useCallback((podcast: Podcast) => {
    const el = document.activeElement as HTMLElement | null;
    openerRef.current = el && el !== document.body ? el : null;
    setActive(podcast);
  }, []);

  // Escape closes, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* preventScroll: moving focus here must not scroll the overlay and pull
       the panel flush against the top edge. */
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close]);

  const overlay = active ? (
    <div
      className="pod-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pod-overlay-title"
      /* Clicks that land on the backdrop itself close; clicks inside the
         panel bubble up to here but are not the backdrop. */
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="pod-overlay-panel" ref={panelRef} tabIndex={-1}>
        <button type="button" className="pod-overlay-close" onClick={close} aria-label="Close episode">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="pod-overlay-player">
          {active.youtubeId ? (
            <iframe
              className="pod-player-frame"
              src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            /* Written up but not uploaded yet — see youtubeId in
               src/content/podcasts.ts. */
            <div className="pod-player pod-player--empty">
              <span className="pod-player-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <p>Full episode video coming soon</p>
            </div>
          )}
        </div>

        <div className="pod-overlay-body">
          <p className="pod-episode-kicker">
            <span>Episode {String(active.episode).padStart(2, "0")}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(active.publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{active.duration}</span>
          </p>

          <h2 id="pod-overlay-title" className="v2-section-title-compact pod-overlay-title">
            {active.title}
          </h2>

          <p className="pod-overlay-guest">
            {active.guest}
            {/* The guest's title is optional — no dangling dash without one. */}
            {active.guestRole && <span className="pod-episode-role"> — {active.guestRole}</span>}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return { open, overlay };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
