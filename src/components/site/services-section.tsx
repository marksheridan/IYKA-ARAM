"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Reveal } from "./reveal";
import { services } from "@/content/services";


/* The eased glide, and the quiet period that has to follow a wheel gesture
   before the next one is accepted. 620ms must stay in step with the
   transition on .sv-rail.is-live .sv-track in globals.css.
   A trackpad fling keeps emitting wheel events long after the fingers have
   stopped, so the lock is released by silence rather than by a fixed
   timeout — that is what makes one gesture move exactly one card. */
const GLIDE_MS = 620;
const QUIET_MS = 220;

/* Widest a card is allowed to get before the rail would rather show another
   one. The real width is derived from the container so that a whole number
   of cards fills it exactly. 383 is the Figma card's own width — below
   about 300 the veil leaves too little cream for two lines of description. */
const CARD_CEILING = 383;

/* The cream veil swept across the lower left of every card, traced off the
   Figma vector. objectBoundingBox units, so the one definition stretches to
   whatever size the rail settles on. Ends at the right edge 69.6% down,
   then squares off round the bottom of the card. */
const VEIL_PATH =
  "M 0.07833 0 C 0.07833 0.03854 0.07467 0.07996 0.07833 0.11561 " +
  "C 0.08146 0.14663 0.08877 0.1736 0.09661 0.20231 " +
  "C 0.10444 0.23141 0.11201 0.25973 0.12533 0.28902 " +
  "C 0.13995 0.32081 0.15901 0.35414 0.18277 0.38536 " +
  "C 0.20809 0.4185 0.24073 0.45241 0.27415 0.4817 " +
  "C 0.30627 0.51002 0.33838 0.5368 0.37859 0.55877 " +
  "C 0.42115 0.58208 0.47572 0.60019 0.5248 0.61657 " +
  "C 0.57154 0.63218 0.62167 0.64509 0.6658 0.65511 " +
  "C 0.70366 0.66358 0.73029 0.66859 0.77285 0.67437 " +
  "C 0.8342 0.68266 0.92428 0.68844 1 0.69557 " +
  "L 1 1 L 0 1 L 0 0 Z";

export function ServicesSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  /* is-live is the wheel-driven rail; false is the native carousel. */
  const [live, setLive] = useState(false);
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState(0);
  const [step, setStep] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  /* The wheel listener is bound once and must not close over stale state. */
  const indexRef = useRef(0);
  const maxRef = useRef(0);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(maxRef.current, next));
    indexRef.current = clamped;
    setIndex(clamped);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    /* hover:none keeps the wheel rail off touch devices however wide they
       are; below 640px the native swipe is simply the better gesture. */
    const optOut = window.matchMedia(
      "(max-width: 640px), (prefers-reduced-motion: reduce), (hover: none)",
    );

    const measure = () => {
      if (optOut.matches) {
        maxRef.current = 0;
        setLive(false);
        setCard(0);
        setStep(0);
        setMaxIndex(0);
        go(0);
        return;
      }
      const width = viewport.clientWidth;
      if (!width) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

      /* Round rather than floor: a container that can nearly fit another
         card should show it slightly narrowed instead of leaving a gap. */
      const per = Math.max(
        1,
        Math.min(services.length, Math.round((width + gap) / (CARD_CEILING + gap))),
      );
      /* Derived, not measured. The same arithmetic sets the card width and
         the travel per step, so the two cannot drift apart the way a
         measured value can while the layout it depends on is still moving. */
      const cardWidth = (width - (per - 1) * gap) / per;

      maxRef.current = Math.max(0, services.length - per);
      setCard(cardWidth);
      setStep(cardWidth + gap);
      setMaxIndex(maxRef.current);
      setLive(true);
      if (indexRef.current > maxRef.current) go(maxRef.current);
    };

    measure();

    /* Observing the viewport, whose width is the container's and owes
       nothing to the cards inside it, so this cannot feed back on itself. */
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    optOut.addEventListener("change", measure);

    return () => {
      ro.disconnect();
      optOut.removeEventListener("change", measure);
    };
  }, [go]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !live) return;

    let busy = false;
    let timer = 0;
    const arm = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        busy = false;
      }, ms);
    };

    /* The glide itself reports when it is over, which is more trustworthy
       than counting it out: a backgrounded tab throttles timers, and a lock
       released only by a timer can outlive the animation by minutes and
       leave the rail swallowing scrolls it is no longer going to act on.
       Once the transform lands, all that is left to wait out is the tail of
       the gesture. */
    const onGlideEnd = (e: TransitionEvent) => {
      if (e.propertyName === "transform") arm(QUIET_MS);
    };
    track.addEventListener("transitionend", onGlideEnd);

    const onWheel = (e: WheelEvent) => {
      const dir =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? Math.sign(e.deltaX) : Math.sign(e.deltaY);
      if (!dir) return;

      /* Past either end the rail has nothing left to give, so the gesture is
         left alone and the page scrolls on as it normally would. */
      const next = indexRef.current + dir;
      if (next < 0 || next > maxRef.current) return;

      e.preventDefault();
      /* Mid-glide, or still inside the tail of a fling: swallow the event and
         push the release further out, so the momentum cannot queue a second
         card up behind the one already moving. */
      if (busy) {
        arm(QUIET_MS);
        return;
      }
      go(next);
      busy = true;
      arm(GLIDE_MS + QUIET_MS);
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.clearTimeout(timer);
      viewport.removeEventListener("wheel", onWheel);
      track.removeEventListener("transitionend", onGlideEnd);
    };
  }, [live, go]);

  /* The wheel is a pointer gesture, so the rail needs a keyboard equivalent. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!live) return;
    const targets: Record<string, number> = {
      ArrowRight: indexRef.current + 1,
      ArrowLeft: indexRef.current - 1,
      Home: 0,
      End: maxRef.current,
    };
    if (!(e.key in targets)) return;
    e.preventDefault();
    go(targets[e.key]);
  };

  /* The background lives in .sv-rail now — it is a gradient the foliage
     canopy has to meet exactly, not a flat colour worth inlining. */
  const railStyle = (card ? { "--sv-card": `${card}px` } : undefined) as
    | CSSProperties
    | undefined;

  return (
    <section
      id="services"
      className={`v2-landing v2-section-py scroll-mt-20 sv-rail${live ? " is-live" : ""}`}
      style={railStyle}
    >
      <div className="sv-canopy" aria-hidden="true" />

      {/* One definition for all twelve veils. Zero-sized and taken out of
          flow so it costs no layout — a defs-only svg still renders as an
          inline box otherwise, and leaves a stray line of space here. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="sv-veil-clip" clipPathUnits="objectBoundingBox">
            <path d={VEIL_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div className="v2-container">
        <div className="v2-services-head">
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              What We Offer
            </p>
            <h2 className="sv-title">Healing without the prescription pad.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="/services" className="v2-btn v2-btn-outline-cream">
              All Services
            </a>
          </Reveal>
        </div>

        <div
          className="sv-viewport"
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Services"
          tabIndex={live ? 0 : -1}
          onKeyDown={onKeyDown}
        >
          <ol
            className="sv-track"
            ref={trackRef}
            style={live ? { transform: `translate3d(${-index * step}px, 0, 0)` } : undefined}
          >
            {services.map((s) => (
              <li className="sv-card" key={s.num}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="sv-card-img"
                />
                <span className="sv-card-veil" />
                <div className="sv-card-body">
                  <h3 className="sv-card-name">{s.name}</h3>
                  <p className="sv-card-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {maxIndex > 0 && (
          <div className="sv-dots" aria-hidden="true">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <span key={i} className={`sv-dot${i === index ? " is-on" : ""}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
