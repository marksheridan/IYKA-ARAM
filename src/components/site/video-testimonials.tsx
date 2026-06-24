"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "./reveal";

const TOTAL = 8;
const VISIBLE = 3;
const MAX_LEFT = TOTAL - VISIBLE;

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
    tag: "Clinical Nutrition",
  },
];

export function VideoTestimonials() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slideWidth = useCallback(() => {
    if (!trackRef.current) return 0;
    const slide = trackRef.current.querySelector<HTMLElement>(".vtc-slide");
    return slide ? slide.offsetWidth + 12 : 0;
  }, []);

  const stopAllVideos = useCallback(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      vid.pause();
      cardRefs.current[i]?.classList.remove("playing");
      if (barRefs.current[i]) barRefs.current[i]!.style.width = "0%";
    });
  }, []);

  const navigateTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(MAX_LEFT, index));
    setCurrent(next);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${next * slideWidth()}px)`;
    }
    const centerIdx = next + 1;
    cardRefs.current.forEach((card, i) => {
      card?.classList.toggle("vtc-center", i === centerIdx);
    });
  }, [slideWidth]);

  const goTo = useCallback((index: number) => {
    stopAllVideos();
    navigateTo(index);
  }, [stopAllVideos, navigateTo]);

  useEffect(() => {
    navigateTo(0);
  }, [navigateTo]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    };
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd);
    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, goTo]);

  function handlePlay(idx: number) {
    stopAllVideos();
    navigateTo(Math.max(0, Math.min(MAX_LEFT, idx - 1)));
    const vid = videoRefs.current[idx];
    const card = cardRefs.current[idx];
    if (vid && card) {
      vid.play();
      card.classList.add("playing");
    }
  }

  function handlePause(idx: number) {
    videoRefs.current[idx]?.pause();
    cardRefs.current[idx]?.classList.remove("playing");
  }

  function handleTimeUpdate(idx: number) {
    const vid = videoRefs.current[idx];
    const bar = barRefs.current[idx];
    if (vid && bar && vid.duration) {
      bar.style.width = `${(vid.currentTime / vid.duration) * 100}%`;
    }
  }

  function handleEnded(idx: number) {
    cardRefs.current[idx]?.classList.remove("playing");
    if (barRefs.current[idx]) barRefs.current[idx]!.style.width = "100%";
  }

  const centerIdx = current + 1;

  return (
    <section id="testimonials" style={{ background: "var(--dark)", padding: "clamp(4rem,10vw,8rem) 0" }}>
      <div className="v2-container">
        {/* Shared header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              Patient Stories
            </p>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", color: "var(--cream)", fontWeight: 300 }}>
              Healing that speaks<br /><em style={{ color: "var(--gold)" }}>for itself.</em>
            </h2>
          </Reveal>
        </div>

        {/* Text testimonials */}
        <div className="v2-testimonials-grid" style={{ marginBottom: "4rem" }}>
          {textTestimonials.map((t, i) => (
            <Reveal key={t.name} className="v2-testimonial-card v2-testimonial-card--dark" delay={i * 0.1}>
              <div className="v2-testimonial-tag">{t.tag}</div>
              <svg className="v2-testimonial-quote-mark" width="36" height="28" viewBox="0 0 36 28" fill="none">
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
            </Reveal>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3.5rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,151,60,0.2)" }} />
          <p className="v2-section-label" style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>In Their Own Words</p>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,151,60,0.2)" }} />
        </div>

        {/* Video carousel */}
        <div className="vtc-root">
          <button
            className="vtc-arrow vtc-prev"
            disabled={current === 0}
            onClick={() => goTo(current - 1)}
            aria-label="Previous"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="vtc-window">
            <div className="vtc-track" ref={trackRef}>
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n, i) => (
                <div key={n} className="vtc-slide">
                  <div
                    className={`vtc-card${i === centerIdx ? " vtc-center" : ""}`}
                    ref={(el) => { cardRefs.current[i] = el; }}
                  >
                    <video
                      ref={(el) => { videoRefs.current[i] = el; }}
                      src={`/videos/testimonial-${n}.mp4`}
                      className="vtc-video"
                      playsInline
                      preload="metadata"
                      onTimeUpdate={() => handleTimeUpdate(i)}
                      onEnded={() => handleEnded(i)}
                    />

                    <div className="vtc-overlay">
                      <button className="vtc-btn vtc-play" aria-label="Play" onClick={() => handlePlay(i)}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
                        </svg>
                      </button>
                      <button className="vtc-btn vtc-pause" aria-label="Pause" onClick={() => handlePause(i)}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      </button>
                    </div>

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
            disabled={current === MAX_LEFT}
            onClick={() => goTo(current + 1)}
            aria-label="Next"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="vtc-dots">
          {Array.from({ length: TOTAL }, (_, i) => (
            <button
              key={i}
              className={`vtc-dot${i === centerIdx ? " active" : ""}`}
              aria-label={`Go to video ${i + 1}`}
              onClick={() => goTo(Math.max(0, Math.min(MAX_LEFT, i - 1)))}
            />
          ))}
        </div>

        <p className="vtc-counter">{centerIdx + 1} / {TOTAL}</p>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
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
