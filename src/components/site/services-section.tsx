import { BookButton } from "./book-button";
import { services } from "@/content/site";

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-20 bg-sand/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Services</p>
          <h2 className="mt-4 font-display text-3xl text-forest sm:text-4xl">
            Three ways to begin your wellness journey
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="flex flex-col rounded-2xl border border-sand bg-cream p-7"
            >
              <span className="w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-forest">
                {s.tag}
              </span>
              <h3 className="mt-5 font-display text-xl text-forest">
                {s.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted">{s.desc}</p>
              <BookButton
                interest={s.interest}
                className="mt-6 w-full bg-forest hover:bg-ink"
              >
                Book now
              </BookButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
