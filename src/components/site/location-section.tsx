import { location } from "@/content/site";

export function LocationSection() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            {location.kicker}
          </p>
          <h2 className="mt-4 font-display text-3xl text-forest sm:text-4xl">
            {location.heading}
          </h2>
          <p className="mt-5 text-muted">{location.body}</p>
          <p className="mt-4 text-sm text-muted">
            Full address, directions and an interactive map will appear here.
          </p>
        </div>

        {/* Placeholder for the Meghalaya map */}
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-sand bg-gradient-to-br from-sage/25 to-cream text-sm text-muted">
          Meghalaya map
        </div>
      </div>
    </section>
  );
}
