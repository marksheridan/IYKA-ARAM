"use client";

import { useEffect, useState } from "react";
import { BookButton } from "./book-button";

const heroLines = [
  "Ancient wisdom meets modern clinical science.",
  "Root-cause healing, no prescription pad.",
  "Northeast India's first functional medicine startup.",
  "Where nature and evidence-based care unite.",
];

const marqueeItems = [
  "Functional Medicine",
  "Yoga Therapy",
  "Naturopathy",
  "Clinical Nutrition",
  "Ayurveda",
  "Panchakarma",
  "Hydrotherapy",
  "Physiotherapy",
  "Mud Therapy",
  "Online Consultation",
];

export function Hero() {
  const [slide, setSlide] = useState(0);
  const [line, setLine] = useState(0);

  // Cross-fade the two hero photos every 7s.
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % 2), 7000);
    return () => clearInterval(id);
  }, []);

  // Rotate the sub-headline lines every 3.5s.
  useEffect(() => {
    const id = setInterval(
      () => setLine((l) => (l + 1) % heroLines.length),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="v2-landing">
      <section className="v2-hero" aria-label="Hero">
        <div className="v2-hero-bg">
          <div
            className={`v2-hero-slide ${slide === 0 ? "is-active" : ""}`}
            style={{ backgroundImage: "url('/hero.jpg')", opacity: slide === 0 ? 1 : 0 }}
            aria-hidden="true"
          />
          <div
            className={`v2-hero-slide v2-hero-slide-2 ${slide === 1 ? "is-active" : ""}`}
            style={{ backgroundImage: "url('/hero2.jpg')", opacity: slide === 1 ? 1 : 0 }}
            aria-hidden="true"
          />
          <div className="v2-hero-overlay" aria-hidden="true" />
        </div>

        <div className="v2-hero-content">
          <div style={{ maxWidth: "44rem" }}>
            <p
              className="v2-section-label v2-reveal"
              style={{ color: "var(--gold-light)", marginBottom: "1.5rem" }}
            >
              Shillong · Meghalaya · Northeast India
            </p>

            <h1
              className="v2-reveal v2-reveal-1"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                color: "var(--cream)",
                fontWeight: 300,
                lineHeight: 1.05,
                marginBottom: "1.5rem",
              }}
            >
              Clinical Wellness.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>
                The Drugless
              </em>
              <br />
              Healthcare.
            </h1>

            <div className="v2-hero-rotate v2-reveal v2-reveal-2">
              {heroLines.map((text, i) => (
                <p
                  key={i}
                  className={`v2-hero-rotate-line ${i === line ? "is-active" : ""}`}
                >
                  {text}
                </p>
              ))}
            </div>

            <div
              className="v2-reveal v2-reveal-3"
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
            >
              <BookButton
                interest="CONSULTATION"
                className="v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit]"
              >
                Book a Consultation
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </BookButton>
              <a href="#services" className="v2-btn v2-btn-outline-cream">
                Explore Services
              </a>
            </div>
          </div>

          <div className="v2-scroll-indicator v2-reveal v2-reveal-5">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(248,244,238,0.4)",
              }}
            >
              Scroll
            </span>
            <div className="v2-scroll-line" />
          </div>
        </div>
      </section>

      <div className="v2-marquee-section" aria-hidden="true">
        <div className="v2-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span className="v2-marquee-item" key={i}>
              {item}
              <svg width="6" height="6" viewBox="0 0 6 6" fill="var(--gold)" style={{ marginLeft: "2rem" }}>
                <circle cx="3" cy="3" r="3" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
