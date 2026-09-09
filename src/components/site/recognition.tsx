import Image from "next/image";
import { Reveal } from "./reveal";

/* Drop the official artwork into /public/logos and fill in `logo` below.
   Any entry without a `logo` falls back to its gold monogram box, so the
   row stays presentable while files are still being collected.
   See public/logos/README.md for the expected format.

   Government recognition and commercial collaboration are kept in separate
   groups on purpose. Presenting a ministry emblem beside a retail partner
   under one "Recognised & Collaborated With" heading invited the reader to
   credit the brand with an endorsement it does not have. */
type Org = {
  name: string;
  mono: string;
  label: string;
  logo?: string;
};

const recognisedBy: Org[] = [
  { name: "Ministry of AYUSH", mono: "AY", label: "Govt. of India", logo: "/logos/ayush.png" },
  { name: "Ministry of Education", mono: "ME", label: "Govt. of India", logo: "/logos/education.png" },
  { name: "Govt. of Meghalaya", mono: "GM", label: "State Recognition", logo: "/logos/meghalaya.png" },
];

const collaborators: Org[] = [
  { name: "Decathlon", mono: "DC", label: "Collaboration", logo: "/logos/decathlon.png" },
  { name: "Himachal Pradesh Tourism", mono: "HP", label: "Collaboration", logo: "/logos/hp-tourism.png" },
];

function OrgGrid({ orgs, offset = 0 }: { orgs: Org[]; offset?: number }) {
  return (
    <div className="v2-recognition-grid">
      {orgs.map((r, i) => (
        <Reveal key={r.name} className="v2-recognition-item" delay={(offset + i) * 0.08}>
          {/* The emblems already carry the organisation's name, so the text
              labels are dropped once a logo is in place. Entries still on
              the monogram fallback keep theirs — an unlabelled "HP" box
              would say nothing. The alt text carries the name either way. */}
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
  );
}

/* Green rather than the default gold of .v2-section-label: gold on this
   near-white band lands at 2.4:1, too weak for text this small and this
   widely tracked. Green is 9.2:1. */
const labelStyle = {
  textAlign: "center" as const,
  color: "var(--green)",
  marginBottom: "2rem",
};

export function Recognition() {
  return (
    <section
      id="recognition"
      className="v2-landing scroll-mt-20"
      style={{ background: "var(--cream-band)", paddingBlock: "var(--section-py-compact)" }}
    >
      <div className="v2-container">
        <Reveal>
          <p className="v2-section-label" style={labelStyle}>
            Recognised by
          </p>
        </Reveal>
        <OrgGrid orgs={recognisedBy} />

        <Reveal>
          <p
            className="v2-section-label"
            style={{ ...labelStyle, marginTop: "3rem" }}
          >
            In collaboration with
          </p>
        </Reveal>
        <OrgGrid orgs={collaborators} offset={recognisedBy.length} />
      </div>
    </section>
  );
}
