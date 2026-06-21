import { Reveal } from "./reveal";

const recognitions = [
  { name: "Ministry of AYUSH", mono: "AY", label: "Govt. of India" },
  { name: "Ministry of Education", mono: "ME", label: "Govt. of India" },
  { name: "Govt. of Meghalaya", mono: "GM", label: "State Recognition" },
  { name: "Decathlon", mono: "DC", label: "Collaboration" },
  { name: "HP Tourism", mono: "HP", label: "Collaboration" },
];

export function Recognition() {
  return (
    <section
      id="recognition"
      className="v2-landing scroll-mt-20"
      style={{ background: "var(--green)", paddingBlock: "3.5rem" }}
    >
      <div className="v2-container">
        <Reveal>
          <p
            className="v2-section-label"
            style={{ textAlign: "center", color: "var(--gold-light)", marginBottom: "2.5rem" }}
          >
            Recognised &amp; Collaborated With
          </p>
        </Reveal>
        <div className="v2-recognition-grid">
          {recognitions.map((r, i) => (
            <Reveal key={r.name} className="v2-recognition-item" delay={i * 0.08}>
              <div className="v2-recognition-monogram">{r.mono}</div>
              <span className="v2-recognition-name">{r.name}</span>
              <span className="v2-recognition-sub">{r.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
