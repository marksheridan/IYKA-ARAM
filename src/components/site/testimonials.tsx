import { testimonials } from "@/content/site";

export function Testimonials() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Stories</p>
          <h2 className="mt-4 font-display text-3xl text-forest sm:text-4xl">
            From our community
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((q, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-sand bg-cream p-7"
            >
              <span className="font-display text-4xl leading-none text-gold">
                &ldquo;
              </span>
              <blockquote className="mt-3 flex-1 text-sm text-ink/80">
                {q.quote}
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-wide text-muted">
                {q.name}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Podcast reels, yoga events and video testimonials will feature here.
        </p>
      </div>
    </section>
  );
}
