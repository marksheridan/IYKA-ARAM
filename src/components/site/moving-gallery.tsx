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
  { src: "/gallery/img3.jpg", tag: "The Clinic", caption: "IYKA-ARAM clinic", alt: "The IYKA-ARAM clinic building viewed from the front steps" },
  { src: "/gallery/img1.jpg", tag: "Shillong", caption: "Wellness with a view", alt: "The IYKA-ARAM clinic building and hillside view at sunset" },
  { src: "/gallery/img4.jpg", tag: "Visitors", caption: "Welcoming guests", alt: "Visitors standing in front of the IYKA-ARAM clinic entrance" },
  { src: "/gallery/img5.jpg", tag: "Community", caption: "Clinic community", alt: "A group photo outside the IYKA-ARAM clinic" },
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
