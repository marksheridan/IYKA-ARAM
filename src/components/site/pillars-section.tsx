import { Reveal } from "./reveal";

/* The five IYKA sub-brands, promoted from small chips into a full
   section at the client's request (26 Jul 2026). */
const pillars = [
  {
    num: "01",
    name: "IYKA Learn",
    desc: "Workshops, teacher training and certified courses that put real health literacy into people's hands.",
  },
  {
    num: "02",
    name: "IYKA Circle",
    desc: "Our community — member events, group programmes and the people walking this path alongside you.",
  },
  {
    num: "03",
    name: "IYKA Therapies",
    desc: "The clinical core: functional medicine, naturopathy, acupuncture, yoga therapy and physiotherapy.",
  },
  {
    num: "04",
    name: "IYKA Living",
    desc: "Everyday wellness you can hold — clean formulations and lifestyle essentials from our practitioners.",
  },
  {
    num: "05",
    name: "IYKA Roots",
    desc: "Our foundation. Free camps, community screenings and outreach across Meghalaya and the Northeast.",
  },
];

export function PillarsSection() {
  return (
    <section
      id="pillars"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ /* Forest, not cream: this sat on the same --cream as the mission above
             it, so the two ran together. Every warm light tint was a dead end
             — clay-100 is within 0.001 luminance of the cream-band section
             below, so it would read as one continuous band. Forest is the
             brand anchor and the only ground that actually separates.
             Title 11.37:1, eyebrow 6.34:1, intro 7.13:1. */
          background: "var(--green)" }}
    >
      <div className="v2-container">
        <div className="pl-head">
          <Reveal>
            <p className="v2-section-label v2-section-label-light" style={{ marginBottom: "1rem" }}>
              One Vision, Five Directions
            </p>
            <h2 className="v2-feature-title pl-title">
              The 5 pillars of
              <br />
              <em>Iyka-Aram.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="pl-intro">
              Everything we build stands on five pillars — from the clinic floor
              to the classroom to the villages we serve.
            </p>
          </Reveal>
        </div>

        <div className="pl-grid">
          {pillars.map((p, i) => (
            <Reveal key={p.num} className="pl-card" delay={i * 0.08}>
              <span className="pl-num">{p.num}</span>
              <h3 className="v2-card-title-lg pl-name">{p.name}</h3>
              <p className="pl-desc">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
