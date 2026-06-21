import Image from "next/image";
import { Reveal } from "./reveal";
import { BookButton } from "./book-button";

export function AboutSection() {
  return (
    <section
      id="about"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream-deep)" }}
    >
      <div className="v2-container">
        <div className="v2-about-grid">
          {/* Image side */}
          <Reveal className="v2-about-image-wrap">
            <div className="v2-about-image-frame">
              <Image
                src="/dr-emidaka.jpg"
                alt="Dr. Emidaka, Founder of IYKA-ARAM"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className="v2-about-image"
              />
              <div className="v2-about-badge">
                <span className="v2-about-badge-num">10+</span>
                <span className="v2-about-badge-text">
                  Years of
                  <br />
                  Clinical Practice
                </span>
              </div>
            </div>
          </Reveal>

          {/* Text side */}
          <Reveal delay={0.2}>
            <p className="v2-section-label" style={{ marginBottom: "1.2rem" }}>
              Meet the Founder
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: "0.5rem" }}>
              Dr. Emidaka
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--gold)",
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.8rem",
              }}
            >
              B.Nat, M.Sc Clinical Nutrition · Functional Medicine Practitioner
            </p>

            <blockquote
              style={{
                borderLeft: "2px solid var(--gold)",
                paddingLeft: "1.5rem",
                marginBottom: "1.8rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  color: "var(--dark)",
                  lineHeight: 1.4,
                  fontWeight: 300,
                }}
              >
                &ldquo;Making healthcare understandable and simple for all.&rdquo;
              </p>
            </blockquote>

            <p style={{ color: "var(--dark-soft)", lineHeight: 1.8, marginBottom: "1.2rem" }}>
              Dr. Emidaka founded IYKA-ARAM in Shillong with a vision to bring
              integrative, root-cause healthcare to Northeast India. With a
              background in Naturopathy and Clinical Nutrition, she has built a
              practice that bridges ancient healing traditions with evidence-based
              functional medicine.
            </p>
            <p style={{ color: "var(--dark-soft)", lineHeight: 1.8, marginBottom: "2rem" }}>
              Recognised by the Ministry of AYUSH and the Government of Meghalaya,
              her work spans clinical consultations, wellness education, yoga
              therapy retreats, and community outreach through the IYKA Roots
              Foundation.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <BookButton
                interest="CONSULTATION"
                className="v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit]"
              >
                Book with Dr. Emidaka
              </BookButton>
              <a href="/about" className="v2-btn v2-btn-outline-dark">
                Full Profile
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
