import { BookButton } from "./book-button";

/* ────────────────────────────────────────────────────────────────
   HERO IMAGE — swap this when the new photography arrives.
   Drop the file into /public and change the string below;
   nothing else in this file needs to be touched.
   ──────────────────────────────────────────────────────────── */
const heroImage = "/hero.png";

/* The full service list — also drives the scrolling band under the hero. */
const marqueeItems = [
  "Acupuncture",
  "Naturopathy",
  "Yoga Therapy",
  "Ozone Therapy",
  "Functional Medicine Consultation",
  "Functional Nutrition Consultation",
  "Gut Health Reset Programs",
  "Energy Medicine",
  "Longevity",
  "Biohacking",
  "Massage",
  "Physiotherapy",
];

const heroMeta = [
  { k: "Est. 2025", v: "Shillong, Meghalaya" },
  { k: "12 Modalities", v: "Integrative Healthcare" },
  { k: "Recognised", v: "Ministry of AYUSH" },
  { k: "In-Clinic & Online", v: "Across India" },
];

export function Hero() {
  return (
    <div className="v2-landing">
      <section className="v2-hero" aria-label="Hero">
        <div className="v2-hero-bg">
          <div
            className="v2-hero-slide is-active"
            style={{ backgroundImage: `url('${heroImage}')` }}
            aria-hidden="true"
          />
          <div className="v2-hero-overlay" aria-hidden="true" />
          <div className="v2-hero-grain" aria-hidden="true" />
        </div>

        <div className="v2-hero-content">
          <div className="v2-hero-copy">
            <p className="v2-hero-kicker v2-reveal">
              <span className="v2-hero-kicker-rule" aria-hidden="true" />
              Shillong · Meghalaya · Est. 2025
            </p>

            <h1 className="v2-hero-title v2-reveal v2-reveal-1">
              Clinical wellness,
              <br />
              <em>rooted in nature.</em>
            </h1>

            <p className="v2-hero-sub v2-reveal v2-reveal-2">
              Personalised functional medicine, naturopathy and therapeutic
              yoga — in Shillong and online.
            </p>

            <div className="v2-hero-actions v2-reveal v2-reveal-3">
              <BookButton
                interest="CONSULTATION"
                className="v2-btn v2-btn-gold bg-transparent text-[inherit]"
              >
                Book a consultation
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
            <span>Scroll</span>
            <div className="v2-scroll-line" />
          </div>
        </div>

        {/* Credential strip — anchors the fold and reads "premium" at a glance */}
        <div className="v2-hero-meta v2-reveal v2-reveal-5">
          {heroMeta.map((m) => (
            <div className="v2-hero-meta-item" key={m.k}>
              <span className="v2-hero-meta-k">{m.k}</span>
              <span className="v2-hero-meta-v">{m.v}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="v2-marquee-section" aria-hidden="true">
        {/* Duplicated so the -50% travel loops seamlessly at any width. */}
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
