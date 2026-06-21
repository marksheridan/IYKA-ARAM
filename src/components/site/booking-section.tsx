import { Reveal } from "./reveal";
import { BookButton } from "./book-button";

const goldBtn = "v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit] w-full justify-center";

export function BookingSection() {
  return (
    <section
      id="book"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--dark)" }}
    >
      <div className="v2-container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              Begin Your Healing
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "var(--cream)", fontWeight: 300 }}>
              Choose how you want to connect.
            </h2>
          </Reveal>
        </div>

        <div className="v2-book-grid">
          {/* In-Person */}
          <Reveal className="v2-book-card">
            <div className="v2-book-card-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="v2-book-card-title">In-Person Visit</h3>
            <p className="v2-book-card-desc">
              Visit our clinic in Shillong, Meghalaya for a comprehensive in-person consultation.
            </p>
            <div className="v2-book-card-detail">
              <span>Shillong, Meghalaya</span>
              <span>Mon – Sat, 9am – 6pm</span>
            </div>
            <BookButton interest="OFFLINE_SESSION" className={goldBtn}>
              Book Visit
            </BookButton>
          </Reveal>

          {/* Online Consultation — featured */}
          <Reveal className="v2-book-card v2-book-card--featured" delay={0.15}>
            <div className="v2-book-card-tag">Most Popular</div>
            <div className="v2-book-card-icon" style={{ background: "var(--gold)", color: "var(--dark)" }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
            </div>
            <h3 className="v2-book-card-title" style={{ color: "var(--cream)" }}>
              Online Consultation
            </h3>
            <p className="v2-book-card-desc" style={{ color: "rgba(248,244,238,0.65)" }}>
              Expert guidance from Dr. Emidaka via video call — anywhere in India and beyond.
            </p>
            <div
              className="v2-book-card-detail"
              style={{ borderColor: "rgba(248,244,238,0.1)", color: "rgba(248,244,238,0.5)" }}
            >
              <span>Video Call</span>
              <span>All days, flexible hours</span>
            </div>
            <BookButton interest="CONSULTATION" className={goldBtn}>
              Book Online
            </BookButton>
          </Reveal>

          {/* Yoga Class */}
          <Reveal className="v2-book-card" delay={0.25}>
            <div className="v2-book-card-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h3 className="v2-book-card-title">Online Yoga Class</h3>
            <p className="v2-book-card-desc">
              Join live or recorded therapeutic yoga sessions led by certified IYKA instructors.
            </p>
            <div className="v2-book-card-detail">
              <span>Live + Recorded</span>
              <span>Beginner to Advanced</span>
            </div>
            <BookButton interest="YOGA" className={goldBtn}>
              Join Class
            </BookButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
