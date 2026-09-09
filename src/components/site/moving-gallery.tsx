import { Reveal } from "./reveal";

/* ────────────────────────────────────────────────────────────────
   One row of large imagery, held to the same container as every other
   section so it starts and ends on the page's gutters. The visitor
   swipes or scrolls it; cards snap. It used to be two rows travelling
   in opposite directions on 55s and 65s loops — two competing motions
   in a single band. Swap in new event/clinic photos by dropping files
   into /public and editing the array below.
   ──────────────────────────────────────────────────────────── */

type Shot = { src: string; tag: string; caption: string; alt: string };

/* Only real clinic/event photography with verified captions is used here.
   The old /events/event-*.jpg files were generic stock that did not match
   their captions, so they are left out — drop the client's real event
   photos into /public/events and add them to the array below. */
/* One row, swiped rather than auto-scrolled. Order matters now that the
   visitor reads left to right and stops where they like, so lead with the
   strongest images and close on the founder. Add or remove freely — the
   rail no longer needs a minimum count to hide a loop seam. */
const galleryRow: Shot[] = [
  { src: "/gallery/img11.jpg", tag: "Yoga Therapy", caption: "Joy in every session", alt: "Adults and a child laughing with arms raised during a group yoga session" },
  { src: "/gallery/img17.jpg", tag: "Community", caption: "Community health screening", alt: "Practitioners running a health screening station at a community wellness camp" },
  { src: "/gallery/img20.jpg", tag: "Yoga Therapy", caption: "Group therapeutic yoga", alt: "Participants seated in meditation on yoga mats in a bright hall" },
  { src: "/gallery/img27.jpg", tag: "IYKA Learn", caption: "Breathwork & energetic anatomy", alt: "A YONA wellness event display board showing an energetic anatomy infographic and the five benefits of breathwork" },
  { src: "/gallery/img9.jpg", tag: "IYKA Circle", caption: "Certificate ceremony", alt: "A participant receiving a certificate at an IYKA community event" },
  { src: "/gallery/img23.jpg", tag: "Movement", caption: "Mindful movement", alt: "A smiling participant holding a mudra during a yoga session" },
  { src: "/gallery/img8.jpg", tag: "Every Age", caption: "Wellness for all ages", alt: "A young girl on a colourful yoga mat during a wellness session" },
  { src: "/dr-emidaka-bio.jpg", tag: "The Founder", caption: "Dr. Emidaka", alt: "Dr. Emidaka, founder of IYKA-ARAM, seated in the clinic garden in front of the veranda" },
];

function Row({ shots }: { shots: Shot[] }) {
  return (
    <div className="mg-row v2-rail-scroll">
      <div className="mg-track">
        {shots.map((s, i) => (
          <figure className="mg-card" key={`${s.src}-${i}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} loading="lazy" className="mg-img" />
            <figcaption className="mg-caption">
              <span className="mg-tag">{s.tag}</span>
              <p>{s.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function MovingGallery() {
  return (
    <section
      id="events"
      className="v2-landing scroll-mt-20"
      style={{ background: "var(--surface)", paddingBlock: "var(--section-py)", overflow: "hidden" }}
    >
      <div className="v2-container">
        <div className="mg-head">
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold-deep)", marginBottom: "1rem" }}>
              Inside IYKA-ARAM
            </p>
            <h2 className="v2-feature-title mg-title">
              Real people. Real clinic.
              <br />
              <em>Real healing.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="/gallery" className="v2-btn v2-btn-outline-dark">
              View Full Gallery
            </a>
          </Reveal>
        </div>

        {/* One row, not two competing ones. */}
        <Row shots={galleryRow} />
        <p className="v2-rail-cue">
              <svg width="22" height="8" viewBox="0 0 22 8" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <path d="M0 4h20M17 1l3 3-3 3" strokeLinecap="round" />
              </svg>
              Swipe for more
            </p>
      </div>
    </section>
  );
}
