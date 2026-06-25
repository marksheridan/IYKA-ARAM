"use client";

import { useState, useEffect, useCallback } from "react";

const CATEGORIES = ["All", "Clinic", "Yoga & Wellness", "Events", "Team"] as const;

const PHOTOS = [
  { src: "/gallery/img1.jpg",  caption: "Iyka-Aram Clinic, Shillong",           alt: "Exterior of the Iyka-Aram clinic at sunset — a traditional colonial-style two-storey building with cream and dark-brown timber frame in Shillong, Meghalaya", category: "Clinic",          size: "wide" },
  { src: "/gallery/img2.jpg",  caption: "View from the Clinic Veranda",          alt: "View through the Iyka-Aram clinic veranda over the Shillong cityscape at dusk, framed by dark wooden beams and potted plants on either side",                category: "Clinic",          size: "tall" },
  { src: "/gallery/img4.jpg",  caption: "The Iyka-Aram Team",                    alt: "Three members of the Iyka-Aram team standing at the clinic entrance wearing traditional Meghalayan shawls",                                                       category: "Team",            size: "wide" },
  { src: "/gallery/img5.jpg",  caption: "Patients at Iyka-Aram Clinic",          alt: "Group of patients and staff posing together on the front steps of the Iyka-Aram Clinic with the clinic signboard visible above",                                  category: "Team",            size: "wide" },
  { src: "/gallery/img8.jpg",  caption: "YONA Yoga for All Ages",                alt: "A young girl in a pink YONA sweatshirt sitting cross-legged on a colourful yoga mat making a peace sign during a YONA wellness session",                         category: "Yoga & Wellness", size: "wide" },
  { src: "/gallery/img9.jpg",  caption: "YONA Certificate Ceremony",             alt: "A participant receiving a YONA Certificate of Participation from a female instructor in front of a projected YONA logo at a wellness event",                       category: "Events",          size: "wide" },
  { src: "/gallery/img11.jpg", caption: "Joy in Every Session",                  alt: "A child and adult participants laughing with arms raised joyfully during a group yoga session at a YONA wellness event",                                           category: "Yoga & Wellness", size: "wide" },
  { src: "/gallery/img13.jpg", caption: "YONA Certificates of Participation",    alt: "Two YONA Certificates of Participation stacked on a dark surface, illuminated by a beam of natural light",                                                        category: "Events",          size: "wide" },
  { src: "/gallery/img17.jpg", caption: "Community Health Screening",            alt: "A health screening station at a community wellness camp — a practitioner seated at a table with medical equipment while two staff members assist a participant",   category: "Events",          size: "wide" },
  { src: "/gallery/img20.jpg", caption: "Group Yoga Session",                    alt: "Participants seated in a meditative posture on colourful yoga mats during a large group yoga session in a bright hall with floor-to-ceiling windows",              category: "Yoga & Wellness", size: "wide" },
  { src: "/gallery/img23.jpg", caption: "Mindful Movement",                      alt: "A smiling woman in a mustard-yellow YONA sweatshirt holding a mudra gesture mid-movement during a yoga wellness session",                                          category: "Yoga & Wellness", size: "tall" },
  { src: "/gallery/img27.jpg", caption: "Energetic Anatomy & Breathwork",        alt: "YONA wellness event roll-up display board showing an Energetic Anatomy in Yoga infographic, five benefits of breathwork, and the Wheel of Wellness diagram",     category: "Yoga & Wellness", size: "tall" },
] as const;

const ASPECT: Record<string, string> = {
  wide:   "aspect-[4/3]",
  tall:   "aspect-[3/4]",
  square: "aspect-square",
};

/* Matches legacy --container: min(90rem, 100% - 3rem) */
const cx = "w-[min(90rem,100%-3rem)] mx-auto";

export function GalleryClient() {
  const [active, setActive] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  const visible = PHOTOS.filter((p) => active === "All" || p.category === active);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 16);
    return () => clearTimeout(t);
  }, [active]);

  const close = useCallback(() => setLightbox(null), []);
  const prev  = useCallback(() => setLightbox((i) => i === null ? null : (i - 1 + visible.length) % visible.length), [visible.length]);
  const next  = useCallback(() => setLightbox((i) => i === null ? null : (i + 1) % visible.length), [visible.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, prev, next]);

  const lbPhoto = lightbox !== null ? visible[lightbox] : null;

  return (
    <div className="v2-landing">

      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[42vh] items-end overflow-hidden"
        style={{ background: "var(--green)" }}
      >
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gallery/img3.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full object-cover"
          style={{ width: "62%", objectPosition: "center center", opacity: 0.55 }}
        />

        {/* Left-to-right: solid green → transparent (image shows on right) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #2C4028 38%, rgba(44,64,40,0.82) 60%, rgba(44,64,40,0) 82%)",
          }}
        />

        {/* Radial gold accents */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 100%, rgba(200,151,60,0.08), transparent)," +
              "radial-gradient(ellipse 50% 80% at 0% 0%, rgba(200,151,60,0.06), transparent)",
          }}
        />

        {/* Bottom vignette for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(27,25,22,0.4) 0%, transparent 60%)" }}
        />
        <div className={`${cx} relative pb-16 pt-40`}>
          <p className="v2-section-label v2-reveal mb-4" style={{ color: "var(--gold-light)" }}>
            Iyka-Aram Wellness
          </p>
          <h1 className="v2-reveal v2-reveal-1" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", color: "var(--cream)", fontWeight: 300, lineHeight: 1.05 }}>
            Our Gallery
          </h1>
          <p
            className="v2-reveal v2-reveal-2 mt-4 max-w-[32rem] font-light leading-[1.7]"
            style={{ fontSize: "1.05rem", color: "rgba(248,244,238,0.65)" }}
          >
            A visual journey through our clinic, sessions, events, and the community
            we&rsquo;re building in Northeast India.
          </p>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div
        className="sticky top-0 z-50"
        style={{ background: "var(--dark)", borderBottom: "1px solid rgba(200,151,60,0.12)" }}
      >
        <div className={cx}>
          <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${active === cat ? "var(--gold)" : "transparent"}`,
                  padding: "1rem 1.5rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: active === cat ? "var(--gold)" : "rgba(248,244,238,0.45)",
                  cursor: "pointer",
                  transition: "color 0.25s, border-color 0.25s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      <section style={{ padding: "clamp(4rem,10vw,8rem) 0", background: "var(--cream)" }}>
        <div className={cx}>
          {visible.length === 0 ? (
            <p
              className="py-20 text-center font-light"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--dark-soft)" }}
            >
              No photos in this category yet.
            </p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {visible.map((photo, i) => (
                <div
                  key={photo.src}
                  className="mb-4 break-inside-avoid"
                  style={{
                    opacity: entered ? 1 : 0,
                    transform: entered ? "translateY(0)" : "translateY(22px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    transitionDelay: `${Math.min(i * 0.07, 0.45)}s`,
                  }}
                >
                  <div
                    className={`group relative overflow-hidden ${ASPECT[photo.size]} cursor-pointer`}
                    style={{ background: "var(--cream-deep)" }}
                    onClick={() => setLightbox(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ transition: "transform 0.6s var(--ease-out-expo)" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    />

                    {/* Caption overlay */}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top, rgba(27,25,22,0.75) 0%, transparent 50%)" }}
                    >
                      <span
                        className="mb-1"
                        style={{
                          fontSize: "0.62rem", fontWeight: 600,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: "var(--gold)",
                        }}
                      >
                        {photo.category}
                      </span>
                      <p
                        className="font-light leading-[1.3]"
                        style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--cream)" }}
                      >
                        {photo.caption}
                      </p>
                    </div>

                    {/* Expand button */}
                    <button
                      aria-label={`View ${photo.caption}`}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
                      style={{
                        background: "rgba(27,25,22,0.6)",
                        border: "1px solid rgba(200,151,60,0.3)",
                        color: "var(--cream)",
                        transition: "opacity 0.3s, background 0.2s",
                      }}
                      onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--gold)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--dark)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(27,25,22,0.6)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--cream)"; }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "clamp(4rem,10vw,8rem) 0", background: "var(--green)", textAlign: "center" }}>
        <div className={cx}>
          <p className="v2-section-label mb-4" style={{ color: "var(--gold-light)" }}>
            Experience It In Person
          </p>
          <h2
            className="font-light"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "var(--cream)", marginBottom: "1.5rem" }}
          >
            Ready to begin your healing journey?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/booking" className="v2-btn v2-btn-gold">Book a Consultation</a>
            <a href="/" className="v2-btn v2-btn-outline-cream">Back to Home</a>
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lbPhoto && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: "rgba(27,25,22,0.95)" }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center transition-colors"
            style={{ border: "1px solid rgba(248,244,238,0.2)", color: "var(--cream)", background: "none" }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center transition-colors max-sm:left-2"
            style={{ border: "1px solid rgba(248,244,238,0.15)", color: "var(--cream)", background: "none" }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Image + caption */}
          <div
            className="flex max-h-[88vh] max-w-[min(90vw,72rem)] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lbPhoto.src}
              alt={lbPhoto.alt}
              className="max-h-[78vh] max-w-full object-contain"
              style={{ transition: "opacity 0.18s ease" }}
            />
            <p
              className="text-center font-light italic"
              style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "rgba(248,244,238,0.6)" }}
            >
              {lbPhoto.caption}
            </p>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center transition-colors max-sm:right-2"
            style={{ border: "1px solid rgba(248,244,238,0.15)", color: "var(--cream)", background: "none" }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}
