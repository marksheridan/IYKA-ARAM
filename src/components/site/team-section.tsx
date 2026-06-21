import Image from "next/image";
import { team } from "@/content/site";

export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Our Team
          </p>
          <h2 className="mt-4 font-display text-3xl text-forest sm:text-4xl">
            Practitioners who treat the whole person
          </h2>
          <p className="mt-4 text-muted">
            Doctors, therapists, instructors and nutritionists working together
            under one roof.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border border-sand bg-white p-6 text-center"
            >
              {m.image ? (
                <Image
                  src={m.image}
                  alt={m.name ?? m.role}
                  width={96}
                  height={96}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sage/30 to-gold-soft font-display text-2xl text-forest">
                  {m.initials}
                </div>
              )}
              {m.name && (
                <p className="mt-5 font-display text-lg text-forest">{m.name}</p>
              )}
              <p className={`${m.name ? "mt-1" : "mt-5"} text-sm font-medium text-forest`}>
                {m.role}
              </p>
              {m.bio ? (
                <p className="mt-2 text-xs text-muted">{m.bio}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">Profile coming soon</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
