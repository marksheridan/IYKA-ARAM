import { Reveal } from "./reveal";

const testimonials = [
  {
    quote:
      "After years of medication with no real answers, three months at IYKA-ARAM gave me my energy back. Dr. Emidaka actually listened.",
    name: "Priyanka M.",
    location: "Guwahati, Assam",
    tag: "Functional Medicine",
  },
  {
    quote:
      "The online yoga sessions fit perfectly into my schedule and my chronic back pain is finally under control. Life-changing.",
    name: "Rahul T.",
    location: "Delhi",
    tag: "Yoga Therapy",
  },
  {
    quote:
      "I was sceptical about drugless healthcare, but the nutrition plan completely reversed my pre-diabetes in six months.",
    name: "Meena W.",
    location: "Shillong",
    tag: "Clinical Nutrition",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream-deep)" }}
    >
      <div className="v2-container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
              Patient Stories
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 300 }}>
              Healing that speaks
              <br />
              <em style={{ color: "var(--gold)" }}>for itself.</em>
            </h2>
          </Reveal>
        </div>

        <div className="v2-testimonials-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} className="v2-testimonial-card" delay={i * 0.1}>
              <div className="v2-testimonial-tag">{t.tag}</div>
              <svg className="v2-testimonial-quote-mark" width="36" height="28" viewBox="0 0 36 28" fill="none">
                <path
                  d="M0 28V17.5C0 7.5 5.5 2 16.5 0L18 3C12.5 4.5 9.5 7.5 9 12H16V28H0ZM20 28V17.5C20 7.5 25.5 2 36.5 0L38 3C32.5 4.5 29.5 7.5 29 12H36V28H20Z"
                  fill="var(--gold)"
                  opacity="0.2"
                />
              </svg>
              <p className="v2-testimonial-text">{t.quote}</p>
              <div className="v2-testimonial-author">
                <div className="v2-testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <span className="v2-testimonial-name">{t.name}</span>
                  <span className="v2-testimonial-location">{t.location}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
