import Image from "next/image";
import { Reveal } from "./reveal";

/* Drop the official artwork into /public/logos and fill in `logo` below.
   Any entry without a `logo` falls back to its gold monogram box, so the
   row stays presentable while files are still being collected.
   See public/logos/README.md for the expected format. */
const recognitions: {
  name: string;
  mono: string;
  label: string;
  logo?: string;
}[] = [
  { name: "Ministry of AYUSH", mono: "AY", label: "Govt. of India", logo: "/logos/ayush.png" },
  { name: "Ministry of Education", mono: "ME", label: "Govt. of India", logo: "/logos/education.png" },
  { name: "Govt. of Meghalaya", mono: "GM", label: "State Recognition", logo: "/logos/meghalaya.png" },
  { name: "Decathlon", mono: "DC", label: "Collaboration", logo: "/logos/decathlon.png" },
  { name: "Himachal Pradesh Tourism", mono: "HP", label: "Collaboration", logo: "/logos/hp-tourism.png" },
];

export function Recognition() {
  return (
    <section
      id="recognition"
      className="v2-landing scroll-mt-20"
      style={{ background: "var(--cream-band)", paddingBlock: "3.5rem" }}
    >
      <div className="v2-container">
        <Reveal>
          {/* Green rather than the default gold of .v2-section-label: gold
              on this near-white band lands at 2.4:1, too weak for text
              this small and this widely tracked. Green is 9.2:1. */}
          <p
            className="v2-section-label"
            style={{ textAlign: "center", color: "var(--green)", marginBottom: "2.5rem" }}
          >
            Recognised &amp; Collaborated With
          </p>
        </Reveal>
        <div className="v2-recognition-grid">
          {recognitions.map((r, i) => (
            <Reveal key={r.name} className="v2-recognition-item" delay={i * 0.08}>
              {/* The emblems already carry the organisation's name, so the
                  text labels are dropped once a logo is in place. Entries
                  still on the monogram fallback keep theirs — an unlabelled
                  "HP" box would say nothing. The alt text carries the name
                  either way. */}
              {r.logo ? (
                <div className="v2-recognition-logo">
                  <Image
                    src={r.logo}
                    alt={`${r.name} — ${r.label}`}
                    width={140}
                    height={64}
                    style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
                  />
                </div>
              ) : (
                <>
                  <div className="v2-recognition-monogram">{r.mono}</div>
                  <span className="v2-recognition-name">{r.name}</span>
                  <span className="v2-recognition-sub">{r.label}</span>
                </>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
