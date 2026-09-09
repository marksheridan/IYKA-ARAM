import { Fragment } from "react";
import Image from "next/image";

import { Reveal } from "./reveal";

const stats = [
  { num: "12", sup: "", label: "Disciplines of healing" },
  { num: "5", sup: "", label: "Pillars under IYKA" },
  { num: "2025", sup: "", label: "Founded in Shillong" },
];

const pillars = [
  {
    icon: "🌿",
    title: "Drugless",
    desc: "We address the root cause — not the symptom. No unnecessary prescriptions, just your body healing itself.",
  },
  {
    icon: "⚕️",
    title: "Integrative",
    desc: "Twelve healing disciplines working in harmony: Naturopathy, Yoga Therapy, Functional Medicine, Nutrition, and more.",
  },
  {
    icon: "∞",
    title: "Longevity",
    desc: "Building health that lasts — through lifestyle, nutrition, and daily practices tailored to you.",
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
        <div className="v2-mission-grid">
          {/* Left: logo above a horizontal row of stats */}
          <Reveal className="v2-mission-stats">
            <Image
              src="/logo-color.png"
              alt="IYKA-ARAM — Wellness Starts Here"
              width={518}
              height={481}
              className="v2-mission-logo"
            />
            <div className="v2-mission-metrics">
              {stats.map((s, i) => (
                <Fragment key={s.label}>
                  <div className="v2-stat-block">
                    <span className="v2-stat-num">
                      {s.num}
                      {s.sup && <sup>{s.sup}</sup>}
                    </span>
                    <span className="v2-stat-label">{s.label}</span>
                  </div>
                  {i < stats.length - 1 && <div className="v2-stat-divider" />}
                </Fragment>
              ))}
            </div>
          </Reveal>

          {/* Right: mission text */}
          <Reveal delay={0.2}>
            <p className="v2-section-label" style={{ marginBottom: "1.2rem" }}>
              Our Mission
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                color: "var(--dark)",
                marginBottom: "1.5rem",
                fontWeight: 700,
              }}
            >
              Making healthcare <em>understandable</em> and simple for all.
            </h2>
            <p
              style={{
                color: "var(--dark-soft)",
                lineHeight: 1.8,
                marginBottom: "1rem",
                fontSize: "1.05rem",
              }}
            >
              We believe your body has an innate ability to heal — when given the
              right conditions. At IYKA-ARAM, we combine the precision of
              functional medicine with naturopathy, yoga therapy and clinical
              nutrition to address the root cause of illness, not just its symptoms.
            </p>
            <p
              style={{
                color: "var(--dark-soft)",
                lineHeight: 1.8,
                fontSize: "1.05rem",
              }}
            >
              Based in the misty hills of Shillong, Meghalaya, we serve Northeast
              India and beyond — in-person and online.
            </p>
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <span className="v2-gold-line" />
              <span
                style={{
                  /* Body face: the italic is real there, Bricolage has none. */
                  fontFamily: "var(--font-body)",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--gold-deep)",
                }}
              >
                Dr. Emidaka — CEO & Founder
              </span>
            </div>
          </Reveal>
        </div>

        {/* Mission pillars */}
        <div className="v2-pillars-grid">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="v2-pillar-card">
                <span className="v2-pillar-icon">{p.icon}</span>
                <h3 className="v2-pillar-title">{p.title}</h3>
                <p className="v2-pillar-desc">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
