import { Reveal } from "./reveal";
import { BookButton } from "./book-button";

export function CtaSection() {
  return (
    <section className="v2-landing v2-cta-panel">
      <div className="v2-container v2-cta-inner">
        <Reveal>
          <p className="v2-section-label" style={{ color: "var(--gold-light)", marginBottom: "1rem" }}>
            Start Your Journey
          </p>
          <h2
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              color: "var(--cream)",
              fontWeight: 300,
              lineHeight: 1.1,
              maxWidth: "30rem",
            }}
          >
            Because we don&apos;t
            <br />
            <em style={{ color: "var(--gold-light)" }}>settle for less.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.2} style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
          <p
            style={{
              color: "rgba(248,244,238,0.65)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: "28rem",
            }}
          >
            You deserve answers, not just prescriptions. Our team of specialists
            will work with you to understand the root cause and build a lasting
            path to wellness.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <BookButton
              interest="GENERAL"
              className="v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit]"
            >
              Book a Free Call
            </BookButton>
            <a href="#services" className="v2-btn v2-btn-outline-cream">
              Explore Services
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
