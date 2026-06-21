import { mission } from "@/content/site";

export function Mission() {
  return (
    <section id="mission" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">
          {mission.kicker}
        </p>
        <h2 className="mt-5 font-display text-3xl leading-snug text-forest sm:text-4xl">
          {mission.heading}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          {mission.body}
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          {mission.pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-sand bg-white p-6 text-left"
            >
              <div className="font-display text-lg text-forest">{p.title}</div>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
