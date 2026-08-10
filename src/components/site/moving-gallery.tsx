import { Reveal } from "./reveal";

/* ────────────────────────────────────────────────────────────────
   Two full-bleed rows of large imagery that scroll on their own in
   opposite directions. Swap in new event/clinic photos by dropping
   files into /public and editing the two arrays below.
   ──────────────────────────────────────────────────────────── */

type Shot = { src: string; tag: string; caption: string; alt: string };

/* Only real clinic/event photography with verified captions is used here.
   The old /events/event-*.jpg files were generic stock that did not match
   their captions, so they are left out — drop the client's real event
   photos into /public/events and add them to these arrays. */
const rowTop: Shot[] = [
  { src: "/gallery/img1.jpg", tag: "The Clinic", caption: "IYKA-ARAM, Shillong", alt: "Exterior of the IYKA-ARAM clinic in Shillong at sunset" },
  { src: "/gallery/img11.jpg", tag: "Yoga Therapy", caption: "Joy in every session", alt: "Adults and a child laughing with arms raised during a group yoga session" },
  { src: "/gallery/img17.jpg", tag: "Community", caption: "Community health screening", alt: "Practitioners running a health screening station at a community wellness camp" },
  { src: "/gallery/img20.jpg", tag: "Yoga Therapy", caption: "Group therapeutic yoga", alt: "Participants seated in meditation on yoga mats in a bright hall" },
  { src: "/gallery/img8.jpg", tag: "Every Age", caption: "Wellness for all ages", alt: "A young girl on a colourful yoga mat during a wellness session" },
];

const rowBottom: Shot[] = [
  { src: "/gallery/img5.jpg", tag: "Our Patients", caption: "Healing, together", alt: "Patients and staff together on the steps of the IYKA-ARAM clinic" },
  { src: "/gallery/img4.jpg", tag: "The Team", caption: "The practitioners behind IYKA", alt: "Members of the IYKA-ARAM team at the clinic entrance in traditional Meghalayan shawls" },
  { src: "/gallery/img9.jpg", tag: "IYKA Circle", caption: "Certificate ceremony", alt: "A participant receiving a certificate at an IYKA community event" },
  { src: "/gallery/img23.jpg", tag: "Movement", caption: "Mindful movement", alt: "A smiling participant holding a mudra during a yoga session" },
  { src: "/gallery/img2.jpg", tag: "The Clinic", caption: "The view from our veranda", alt: "View over Shillong from the IYKA-ARAM clinic veranda at dusk" },
];

function Row({ shots, reverse }: { shots: Shot[]; reverse?: boolean }) {
  return (
    <div className="mg-row">
      <div className={`mg-track${reverse ? " mg-track--reverse" : ""}`}>
        {[...shots, ...shots].map((s, i) => (
          <figure className="mg-card" key={`${s.src}-${i}`} aria-hidden={i >= shots.length}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={i < shots.length ? s.alt : ""} loading="lazy" className="mg-img" />
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
      style={{ background: "var(--green)", paddingBlock: "clamp(4rem, 9vw, 7rem)", overflow: "hidden" }}
    >
      <div className="v2-container">
        <div className="mg-head">
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold-light)", marginBottom: "1rem" }}>
              Inside IYKA-ARAM
            </p>
            <h2 className="mg-title">
              Real people. Real clinic.
              <br />
              <em>Real healing.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="/gallery" className="v2-btn v2-btn-outline-cream">
              View Full Gallery
            </a>
          </Reveal>
        </div>
      </div>

      <div className="mg-rows">
        <Row shots={rowTop} />
        <Row shots={rowBottom} reverse />
      </div>
    </section>
  );
}
