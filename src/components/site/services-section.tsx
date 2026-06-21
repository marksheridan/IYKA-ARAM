import { Reveal } from "./reveal";

const services = [
  { num: "01", name: "Functional Medicine Consultation", desc: "Root-cause analysis to understand what drives your symptoms" },
  { num: "02", name: "Clinical Nutrition", desc: "Food as medicine — personalised therapeutic diet plans" },
  { num: "03", name: "Naturopathy", desc: "Drug-free healing using natural methods and elements" },
  { num: "04", name: "Yoga Therapy", desc: "Therapeutic yoga for chronic conditions & mental wellness" },
  { num: "05", name: "Ayurveda", desc: "Ancient wisdom adapted to modern clinical protocols" },
  { num: "06", name: "Panchakarma", desc: "Detox, cleanse and rejuvenate through classical Ayurvedic procedures" },
  { num: "07", name: "Hydrotherapy", desc: "Water-based treatments for pain, injury and recovery" },
  { num: "08", name: "Mud Therapy", desc: "Therapeutic earth applications for inflammation and skin" },
  { num: "09", name: "Physiotherapy", desc: "Movement-based rehabilitation and chronic pain management" },
  { num: "10", name: "Online Consultation", desc: "Access expert care from anywhere in Northeast India and beyond" },
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
                fontWeight: 300,
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
