import Image from "next/image";
import { Reveal } from "./reveal";

const team = [
  {
    name: "Dr. Emidaka",
    role: "Founder & Functional Medicine Practitioner",
    initials: "DE",
    speciality: "Naturopathy · Clinical Nutrition",
    photo: "/team/emidaka.jpg",
  },
  {
    name: "Dr. Ramya",
    role: "Consultant Clinical Nutritionist",
    initials: "R",
    speciality: "",
    photo: "/team/practitioner-2.jpg",
  },
  {
    name: "Dr. Wadarisa Garod",
    role: "Chief Medical Officer · Lead Consultant Doctor",
    initials: "WG",
    speciality: "",
    photo: "/team/practitioner-1.jpg",
  },
  {
    name: "Ibalabet Jyrwa",
    role: "Manager",
    initials: "IJ",
    speciality: "",
    photo: "/team/practitioner-3.jpg",
  },
  {
    name: "Khrawborlang Iawrod",
    role: "Male Therapist",
    initials: "KI",
    speciality: "",
    photo: "/team/practitioner-4.jpg",
  },
  {
    name: "Rosiness Khyriem",
    role: "Female Therapist",
    initials: "RK",
    speciality: "",
    photo: "/team/practitioner-5.jpg",
  },
  {
    name: "Aibashisha Wett",
    role: "Female Therapist",
    initials: "AW",
    speciality: "",
    photo: "/team/practitioner-6.jpg",
  },
];

/* Portraits live in /public/team. They are the client's own photographs, so
   the backgrounds differ from card to card — six were shot on location at the
   clinic, Dr. Ramya's was supplied separately — and only the framing is
   normalised: every face is placed at the same size and height so heads line
   up across the row. Anything new dropped in here has to go through
   scripts/normalize-team-portraits.py or it will sit at the wrong height.
   Two plates are too tight for that framing to be reached. Dr. Ramya's is
   phone-sized, and Dr. Emidaka's is a WhatsApp crop the client chose over the
   full-size shoot frame, so both are cropped as wide as their plate allows
   and both heads read larger than the rest — Dr. Ramya's markedly, Dr.
   Emidaka's slightly. Full-size originals of those two frames are the fix.

   All seven names and roles come from the team's own list, in the order the
   portraits were supplied. Two independent checks back that ordering up:
   entry 1's scrubs badge reads "Dr Emidaka Dkhar", and entry 7's reads
   "Ms. Aiba / Iyka Aram Therapist", matching Aibashisha Wett. `speciality` is
   an optional second line, left empty wherever the team gave a role only —
   the card omits it rather than rendering an empty paragraph. */

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
            <h2 className="v2-section-title" style={{ color: "var(--cream)" }}>
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
                <h3 className="v2-card-title-lg v2-team-name">{member.name}</h3>
                <p className="v2-team-role">{member.role}</p>
                {/* Not everyone has a second line yet; an empty <p> would still
                    take its margin and push the card taller than its row-mates. */}
                {member.speciality && (
                  <p className="v2-team-speciality">{member.speciality}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
