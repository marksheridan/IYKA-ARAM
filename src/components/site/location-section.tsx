import { Reveal } from "./reveal";

export function LocationSection() {
  return (
    <section
      id="location"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream)" }}
    >
      <div className="v2-container">
        <div className="v2-location-grid">
          <Reveal>
            <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
              Find Us
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 300,
                marginBottom: "1.5rem",
              }}
            >
              Rooted in Shillong,
              <br />
              <em style={{ color: "var(--gold)" }}>healing beyond borders.</em>
            </h2>
            <p style={{ color: "var(--dark-soft)", lineHeight: 1.8, marginBottom: "2rem" }}>
              Our clinic is nestled in the scenic hills of Shillong, Meghalaya —
              open to patients from across Northeast India and online to the rest
              of the world.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div className="v2-location-detail">
                <svg width="18" height="18" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>Shillong, Meghalaya 793001, India</span>
              </div>
              <div className="v2-location-detail">
                <svg width="18" height="18" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mon – Sat · 9:00 am – 6:00 pm IST</span>
              </div>
              <div className="v2-location-detail">
                <svg width="18" height="18" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                </svg>
                <span>Online consultations available worldwide</span>
              </div>
            </div>
          </Reveal>

          {/* Map embed */}
          <Reveal className="v2-map-embed" delay={0.2}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57432.48!2d91.8933!3d25.5788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3750452ef51e06cf%3A0x15dcfd9af414e6b5!2sShillong%2C%20Meghalaya!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="IYKA-ARAM Wellness location — Shillong, Meghalaya"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
