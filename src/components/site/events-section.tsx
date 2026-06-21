import Image from "next/image";
import { Reveal } from "./reveal";

const subBrands = ["IYKA Learn", "IYKA Circle", "IYKA Therapies", "IYKA Living", "IYKA Roots"];

export function EventsSection() {
  return (
    <section
      id="events"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--green)" }}
    >
      <div className="v2-container">
        <div style={{ marginBottom: "3.5rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold-light)", marginBottom: "1rem" }}>
              Community &amp; Events
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                color: "var(--cream)",
                fontWeight: 300,
                maxWidth: "26rem",
              }}
            >
              Wellness beyond the clinic walls.
            </h2>
          </Reveal>
        </div>

        {/* Events mosaic */}
        <div className="v2-events-grid">
          <Reveal className="v2-event-large">
            <Image src="/events/event-1.jpg" alt="IYKA Wellness Camp" fill sizes="(max-width: 900px) 100vw, 55vw" />
            <div className="v2-event-caption">
              <span className="v2-event-tag">Wellness Camp</span>
              <p>Annual IYKA Wellness Retreat — Shillong</p>
            </div>
          </Reveal>

          <div className="v2-event-col">
            <Reveal className="v2-event-small" delay={0.15}>
              <Image src="/events/event-2.jpg" alt="Yoga Workshop" fill sizes="(max-width: 900px) 100vw, 35vw" />
              <div className="v2-event-caption">
                <span className="v2-event-tag">Yoga Workshop</span>
                <p>IYKA Learn — Teacher Training</p>
              </div>
            </Reveal>
            <Reveal className="v2-event-small" delay={0.25}>
              <Image src="/events/event-3.jpg" alt="Nutrition Talk" fill sizes="(max-width: 900px) 100vw, 35vw" />
              <div className="v2-event-caption">
                <span className="v2-event-tag">Talk</span>
                <p>Clinical Nutrition Masterclass</p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Sub-brands row */}
        <Reveal className="v2-sub-brands" style={{ marginTop: "3.5rem" }}>
          {subBrands.map((brand) => (
            <div className="v2-sub-brand-chip" key={brand}>
              {brand}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
