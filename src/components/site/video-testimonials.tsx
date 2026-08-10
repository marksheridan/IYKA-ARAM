"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./reveal";

const TOTAL = 8;
const INITIAL = 1; /* middle card of the opening 3-up view */
const GAP_PX = 12; /* must match the .vtc-track gap */

const textTestimonials = [
  {
    quote:
      "After years of medication with no real answers, three months at IYKA-ARAM gave me my energy back. Dr. Emidaka actually listened.",
    name: "Priyanka M.",
    location: "Guwahati, Assam",
    tag: "Functional Medicine",
  },
  {
    quote:
      "The online yoga sessions fit perfectly into my schedule and my chronic back pain is finally under control. Life-changing.",
    name: "Rahul T.",
    location: "Delhi",
    tag: "Yoga Therapy",
  },
  {
    quote:
      "I was sceptical about drugless healthcare, but the nutrition plan completely reversed my pre-diabetes in six months.",
    name: "Meena W.",
    location: "Shillong",
    tag: "Functional Nutrition",
  },
  {
    quote:
      "The gut reset programme was the first thing that ever worked for my bloating. Six weeks in, I felt like a different person.",
    name: "Aiban S.",
    location: "Shillong",
    tag: "Gut Health Reset",
  },
  {
    quote:
      "Two acupuncture courses and my migraines went from weekly to almost never. I keep recommending this place.",
    name: "Kyrsoi L.",
    location: "Jowai, Meghalaya",
    tag: "Acupuncture",
  },
  {
    quote:
      "What I value most is being treated as a whole person. They looked at my sleep, my food, my stress — not just my reports.",
    name: "Deepika R.",
    location: "Kolkata",
    tag: "Integrative Care",
  },
];

export function VideoTestimonials() {
  /* Start on the middle card of the opening 3-up view, so the reel leads with
     a centred video rather than one pinned to the left edge. */
  const [active, setActive] = useState(INITIAL);
  const [soundOn, setSoundOn] = useState(false);
  const [inView, setInView] = useState(false);
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll the track so the active card sits in the middle of the window.
  // How many cards are visible is measured, not assumed, so this stays
  // correct at the 2-up and 1-up breakpoints.
  useEffect(() => {
    const apply = () => {
      const track = trackRef.current;
      const win = windowRef.current;
      if (!track || !win) return;
      const slide = track.querySelector<HTMLElement>(".vtc-slide");
      if (!slide) return;
      const step = slide.offsetWidth + GAP_PX;
      const visible = Math.max(1, Math.round((win.clientWidth + GAP_PX) / step));
      const maxLeft = Math.max(0, TOTAL - visible);
      const offset = Math.min(
        maxLeft,
        Math.max(0, active - Math.floor((visible - 1) / 2)),
      );
      track.style.transform = `translateX(-${offset * step}px)`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [active]);

  // Only run the carousel while it is actually on screen. Chrome pauses
  // muted video that scrolls out of view, so without this the reel would
  // stay dead after the visitor scrolls away and comes back.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Exactly one video plays at a time. The others are paused and rewound, so
  // each card shows its first frame until the visitor picks it.
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === active) {
        vid.muted = !soundOn;
        /* `finished` keeps a completed story from restarting itself when the
           section scrolls back into view. */
        if (inView && !finished) vid.play().catch(() => {});
        else vid.pause();
      } else {
        vid.pause();
        vid.muted = true;
        if (vid.currentTime) vid.currentTime = 0;
        const bar = barRefs.current[i];
        if (bar) bar.style.width = "0%";
      }
    });
  }, [active, soundOn, inView, finished]);

  /* Every route into a different story goes through here, so the finished
     state never leaks from one card to the next. */
  function selectVideo(idx: number) {
    setActive(idx);
    setFinished(false);
  }

  function replay() {
    const vid = videoRefs.current[active];
    if (vid) vid.currentTime = 0;
    setFinished(false);
  }

  function handleTimeUpdate(idx: number) {
    if (idx !== active) return;
    const vid = videoRefs.current[idx];
    const bar = barRefs.current[idx];
    if (vid && bar && vid.duration) {
      bar.style.width = `${(vid.currentTime / vid.duration) * 100}%`;
    }
  }

  // A story that ends simply stops — the visitor decides whether to see more.
  function handleEnded(idx: number) {
    if (idx === active) setFinished(true);
  }

  return (
    <section id="testimonials" style={{ background: "var(--dark)", padding: "clamp(4rem,10vw,8rem) 0" }}>
      <div className="v2-container">
        {/* Shared header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              Patient Stories
            </p>
            <h2 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", color: "var(--cream)", fontWeight: 700 }}>
              Healing that speaks<br /><em style={{ color: "var(--gold)" }}>for itself.</em>
            </h2>
          </Reveal>
        </div>
      </div>

      {/* Moving text testimonials — full-bleed, scrolls on its own */}
      <div className="tm-marquee" style={{ marginBottom: "4.5rem" }}>
        <div className="tm-track">
          {[...textTestimonials, ...textTestimonials].map((t, i) => (
            <article className="tm-card" key={`${t.name}-${i}`} aria-hidden={i >= textTestimonials.length}>
              <div className="v2-testimonial-tag">{t.tag}</div>
              <svg className="v2-testimonial-quote-mark" width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
                <path
                  d="M0 28V17.5C0 7.5 5.5 2 16.5 0L18 3C12.5 4.5 9.5 7.5 9 12H16V28H0ZM20 28V17.5C20 7.5 25.5 2 36.5 0L38 3C32.5 4.5 29.5 7.5 29 12H36V28H20Z"
                  fill="var(--gold)"
                  opacity="0.2"
                />
              </svg>
              <p className="v2-testimonial-text" style={{ color: "var(--cream)" }}>{t.quote}</p>
              <div className="v2-testimonial-author" style={{ borderTopColor: "rgba(200,151,60,0.2)" }}>
                <div className="v2-testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <span className="v2-testimonial-name" style={{ color: "var(--cream)" }}>{t.name}</span>
                  <span className="v2-testimonial-location" style={{ color: "var(--cream)", opacity: 0.5 }}>{t.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="v2-container">
        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,151,60,0.2)" }} />
          <p className="v2-section-label" style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>In Their Own Words</p>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,151,60,0.2)" }} />
        </div>

        {/* Video carousel — one story plays, then it hands over to the next */}
        <div className="vtc-root" ref={rootRef}>
          <button
            className="vtc-arrow vtc-prev"
            onClick={() => selectVideo((active - 1 + TOTAL) % TOTAL)}
            aria-label="Previous testimonial"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="vtc-window" ref={windowRef}>
            <div className="vtc-track" ref={trackRef}>
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n, i) => (
                <div key={n} className="vtc-slide">
                  <div
                    className={`vtc-card${i === active ? " vtc-center" : ""}`}
                    onClick={() => { if (i !== active) selectVideo(i); }}
                  >
                    <video
                      ref={(el) => { videoRefs.current[i] = el; }}
                      /* #t=0.1 makes the browser decode and show the opening
                         frame as a poster, so idle cards aren't blank boxes
                         without preloading eight full videos. */
                      src={`/videos/testimonial-${n}.mp4#t=0.1`}
                      className="vtc-video"
                      muted
                      playsInline
                      preload="metadata"
                      onTimeUpdate={() => handleTimeUpdate(i)}
                      onEnded={() => handleEnded(i)}
                    />

                    {i === active && finished && (
                      <button className="vtc-replay" onClick={replay}>
                        <span className="vtc-replay-icon">
                          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5V1L7 6l5 5V7a6 6 0 11-6 6H4a8 8 0 108-8z" />
                          </svg>
                        </span>
                        Watch again
                      </button>
                    )}

                    {i === active && !finished && (
                      <button
                        className="vtc-sound"
                        onClick={() => setSoundOn((s) => !s)}
                        aria-label={soundOn ? "Mute video" : "Unmute video"}
                      >
                        {soundOn ? (
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.47 4.47 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.94 8.94 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        )}
                      </button>
                    )}

                    <div className="vtc-badge">
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                      <span>@iyka_aram_wellness</span>
                    </div>

                    <div className="vtc-progress-wrap">
                      <div className="vtc-progress-bar" ref={(el) => { barRefs.current[i] = el; }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="vtc-arrow vtc-next"
            onClick={() => selectVideo((active + 1) % TOTAL)}
            aria-label="Next testimonial"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* One dot per story */}
        <div className="vtc-dots">
          {Array.from({ length: TOTAL }, (_, i) => (
            <button
              key={i}
              className={`vtc-dot${i === active ? " active" : ""}`}
              aria-label={`Play testimonial ${i + 1}`}
              onClick={() => selectVideo(i)}
            />
          ))}
        </div>

        <p className="vtc-counter">{active + 1} / {TOTAL}</p>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a
            href="https://www.instagram.com/iyka_aram_wellness/"
            target="_blank"
            rel="noopener noreferrer"
            className="v2-btn v2-btn-outline-cream"
          >
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            More on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
