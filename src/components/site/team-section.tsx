import Image from "next/image";
import { Reveal } from "./reveal";

const team = [
  {
    name: "Dr. Emidaka",
    role: "Founder & Functional Medicine Practitioner",
    initials: "DE",
    speciality: "Naturopathy · Clinical Nutrition",
    photo: "/dr-emidaka.jpg",
  },
  {
    name: "Priya Dkhar",
    role: "Senior Yoga Therapist",
    initials: "PD",
    speciality: "Yoga Therapy · Meditation",
    photo: "",
  },
  {
    name: "Richfield K.",
    role: "Clinical Nutritionist",
    initials: "RK",
    speciality: "Therapeutic Nutrition · Gut Health",
    photo: "",
  },
  {
    name: "Banri Phira",
    role: "Ayurveda & Naturopath",
    initials: "BP",
    speciality: "Ayurveda · Panchakarma",
    photo: "",
  },
];

export function TeamSection() {
  return (
    <section
      id="team"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--dark)" }}
    >
      <div className="v2-container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <Reveal>
            <p className="v2-section-label" style={{ color: "var(--gold)", marginBottom: "1rem" }}>
              The Practitioners
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "var(--cream)", fontWeight: 300 }}>
              Guided by specialists,
              <br />
              <em style={{ color: "var(--gold-light)" }}>not generalists.</em>
            </h2>
          </Reveal>
        </div>

        <div className="v2-team-grid">
          {team.map((member, i) => (
            <Reveal key={member.name} className="v2-team-card" delay={i * 0.1}>
              <div className="v2-team-photo">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 900px) 50vw, 22vw"
                  />
                ) : (
                  <span className="v2-team-initials">{member.initials}</span>
                )}
              </div>
              <div className="v2-team-info">
                <h3 className="v2-team-name">{member.name}</h3>
                <p className="v2-team-role">{member.role}</p>
                <p className="v2-team-speciality">{member.speciality}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
