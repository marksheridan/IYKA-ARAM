import Link from "next/link";
import { BookButton } from "@/components/site/book-button";
import { Reveal } from "@/components/site/reveal";

export const metadata = {
  title: "Services",
  description:
    "Acupuncture, naturopathy, yoga therapy, ozone therapy, functional medicine and nutrition, gut health resets, energy medicine, longevity, biohacking, massage and physiotherapy at IYKA-ARAM, Shillong.",
};

/* Mirrors the landing page list — keep the two in sync. */
const services = [
  { num: "01", name: "Acupuncture", desc: "Precision needling to regulate pain, nerve function and energy flow." },
  { num: "02", name: "Naturopathy", desc: "Drug-free healing using natural methods and elements." },
  { num: "03", name: "Yoga Therapy", desc: "Therapeutic yoga for chronic conditions and mental wellness, in-clinic or live online." },
  { num: "04", name: "Ozone Therapy", desc: "Oxygen-based therapy for inflammation, immunity and recovery." },
  { num: "05", name: "Functional Medicine Consultation", desc: "Root-cause analysis to understand what actually drives your symptoms." },
  { num: "06", name: "Functional Nutrition Consultation", desc: "Food as medicine — personalised therapeutic diet plans." },
  { num: "07", name: "Gut Health Reset Programs", desc: "Structured protocols to rebuild digestion and the microbiome." },
  { num: "08", name: "Energy Medicine", desc: "Restoring the body's energetic balance to support deep healing." },
  { num: "09", name: "Longevity", desc: "Preventive, science-led care designed for a longer, fuller life." },
  { num: "10", name: "Biohacking", desc: "Data-driven optimisation of sleep, energy, metabolism and focus." },
  { num: "11", name: "Massage", desc: "Therapeutic bodywork for tension, circulation and recovery." },
  { num: "12", name: "Physiotherapy", desc: "Movement-based rehabilitation and chronic pain management." },
];

export default function ServicesPage() {
  return (
    <div className="v2-landing">
      {/* Hero */}
      <section
        className="scroll-mt-20"
        style={{ background: "var(--green)", padding: "10rem 0 4.5rem" }}
      >
        <div className="v2-container">
          <p className="v2-section-label v2-reveal" style={{ color: "var(--gold-light)", marginBottom: "1rem" }}>
            What We Offer
          </p>
          <h1
            className="v2-reveal v2-reveal-1"
            style={{
              fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)",
              color: "var(--cream)",
              fontWeight: 700,
              lineHeight: 1.03,
              letterSpacing: "-0.02em",
            }}
          >
            Twelve ways to
            <br />
            <em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>heal at the root.</em>
          </h1>
          <p
            className="v2-reveal v2-reveal-2"
            style={{
              marginTop: "1.5rem",
              maxWidth: "34rem",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              fontWeight: 700,
              color: "rgba(248,244,238,0.7)",
            }}
          >
            IYKA-ARAM is an integrative healthcare clinic — naturopathy and yoga,
            functional medicine, and evidence-based drugless therapies, delivered
            in Shillong and online.
          </p>
        </div>
      </section>

      {/* Service list */}
      <section className="v2-section-py" style={{ background: "var(--dark)" }}>
        <div className="v2-container">
          <div className="v2-services-grid">
            {services.map((s, i) => (
              <Reveal key={s.num} className="v2-service-card" delay={(i % 6) * 0.08}>
                <span className="v2-service-num">{s.num}</span>
                <div>
                  <h3 className="v2-service-name">{s.name}</h3>
                  <p className="v2-service-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="v2-section-py" style={{ background: "var(--cream)", textAlign: "center" }}>
        <div className="v2-container">
          <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
            Not sure where to start?
          </p>
          <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", fontWeight: 700, marginBottom: "1.75rem" }}>
            Begin with a consultation.
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <BookButton
              interest="CONSULTATION"
              className="v2-btn v2-btn-gold bg-transparent text-[inherit]"
            >
              Book a Consultation
            </BookButton>
            <Link href="/contact" className="v2-btn v2-btn-outline-dark">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
