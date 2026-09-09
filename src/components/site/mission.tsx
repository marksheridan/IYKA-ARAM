import Image from "next/image";

import { Reveal } from "./reveal";

const stats = [
  { num: "12", sup: "", label: "Disciplines of healing" },
  { num: "5", sup: "", label: "Pillars under IYKA" },
  { num: "2025", sup: "", label: "Founded in Shillong" },
];

/* Stroke icons at the same 1.5 weight as the booking cards, so the three
   read as one set. Leaf, balance, and a continuous loop for longevity. */
const pillars = [
  {
    title: "Drugless",
    desc: "We address the root cause — not the symptom. No unnecessary prescriptions, just your body healing itself.",
    icon: (
      <path d="M4 20c0-8 5-13 16-14 1 11-4 16-12 16H4zm4-2c2-4 5-6 9-7" />
    ),
  },
  {
    title: "Integrative",
    desc: "Twelve healing disciplines working in harmony: Naturopathy, Yoga Therapy, Functional Medicine, Nutrition, and more.",
    icon: (
      <>
        <path d="M12 3v18M5 7h14" />
        <path d="M5 7l-2 6a3.2 3.2 0 006.4 0L7 7M19 7l-2 6a3.2 3.2 0 006.4 0L21 7" transform="translate(-1 0)" />
        <path d="M8 21h8" />
      </>
    ),
  },
  {
    title: "Longevity",
    desc: "Building health that lasts — through lifestyle, nutrition, and daily practices tailored to you.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
  },
];

export function Mission() {
  return (
    <section
      id="mission"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream)" }}
    >
      <div className="v2-container">
        {/* Logo left with the stats rail beneath it, copy right. */}
        <div className="v2-mission-grid">
          <Reveal className="v2-mission-head">
            <Image
              src="/logo-color.png"
              alt="IYKA-ARAM — Wellness Starts Here"
              width={518}
              height={481}
              className="v2-mission-logo"
            />

            {/* A compact row under the logo — it fills this column and
                keeps the page from running three card grids in a row. */}
            <div className="v2-mission-stats">
              {stats.map((st) => (
                <div className="v2-stat-block" key={st.label}>
                  <span className="v2-stat-num">
                    {st.num}
                    {st.sup && <sup>{st.sup}</sup>}
                  </span>
                  <span className="v2-stat-label">{st.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="v2-section-label" style={{ marginBottom: "1.2rem" }}>
              Our Mission
            </p>
            <h2 className="v2-section-title" style={{ color: "var(--dark)" }}>
              Making healthcare <em>understandable</em> and simple for all.
            </h2>

            <p className="v2-mission-copy">
              We believe your body has an innate ability to heal — when given the
              right conditions. At IYKA-ARAM, we combine the precision of
              functional medicine with naturopathy, yoga therapy and clinical
              nutrition to address the root cause of illness, not just its symptoms.
            </p>
            <p className="v2-mission-copy">
              Based in the misty hills of Shillong, Meghalaya, we serve Northeast
              India and beyond — in-person and online.
            </p>
            <div className="v2-mission-sign">
              <span className="v2-gold-line" />
              <span>Dr. Emidaka — Founder</span>
            </div>
          </Reveal>
        </div>

        {/* Mission pillars */}
        <div className="v2-pillars-grid">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="v2-pillar-card">
                <div className="v2-pillar-head">
                  <svg
                    className="v2-pillar-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {p.icon}
                  </svg>
                  <h3 className="v2-card-title-lg v2-pillar-title">{p.title}</h3>
                </div>
                <p className="v2-pillar-desc">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
