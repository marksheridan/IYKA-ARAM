import { Reveal } from "./reveal";

/* Client-supplied service list (26 Jul 2026), in their order.
   IYKA-ARAM is NOT an Ayurveda clinic — Ayurveda and Panchakarma were
   removed at the client's request. Focus: Naturopathy & Yoga,
   Functional Medicine, Integrative Healthcare. */
const services = [
  { num: "01", name: "Acupuncture", desc: "Precision needling to regulate pain, nerve function and energy flow" },
  { num: "02", name: "Naturopathy", desc: "Drug-free healing using natural methods and elements" },
  { num: "03", name: "Yoga Therapy", desc: "Therapeutic yoga for chronic conditions & mental wellness" },
  { num: "04", name: "Ozone Therapy", desc: "Oxygen-based therapy for inflammation, immunity and recovery" },
  { num: "05", name: "Functional Medicine Consultation", desc: "Root-cause analysis to understand what drives your symptoms" },
  { num: "06", name: "Functional Nutrition Consultation", desc: "Food as medicine — personalised therapeutic diet plans" },
  { num: "07", name: "Gut Health Reset Programs", desc: "Structured protocols to rebuild digestion and the microbiome" },
  { num: "08", name: "Energy Medicine", desc: "Restoring the body's energetic balance to support deep healing" },
  { num: "09", name: "Longevity", desc: "Preventive, science-led care designed for a longer, fuller life" },
  { num: "10", name: "Biohacking", desc: "Data-driven optimisation of sleep, energy, metabolism and focus" },
  { num: "11", name: "Massage", desc: "Therapeutic bodywork for tension, circulation and recovery" },
  { num: "12", name: "Physiotherapy", desc: "Movement-based rehabilitation and chronic pain management" },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--dark)" }}
    >
      <div className="v2-container">
        <div className="v2-services-head">
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              What We Offer
            </p>
            <h2
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                color: "var(--cream)",
                fontWeight: 700,
                maxWidth: "22rem",
              }}
            >
              Healing without the prescription pad.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="/services" className="v2-btn v2-btn-outline-cream">
              All Services
            </a>
          </Reveal>
        </div>

        <div className="v2-services-grid">
          {services.map((s, i) => (
            <Reveal
              key={s.num}
              className="v2-service-card"
              delay={(i % 6) * 0.08}
            >
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
  );
}
