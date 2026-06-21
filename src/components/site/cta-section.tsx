import { BookButton } from "./book-button";

export function CtaSection() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-forest px-8 py-16 text-center text-cream">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Let&apos;s make history
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-snug sm:text-4xl">
            Because we don&apos;t settle for less.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Book a consultation or send us an enquiry — our team will be in touch
            to guide your first step.
          </p>
          <div className="mt-8 flex justify-center">
            <BookButton className="bg-gold px-8 py-3.5 text-base text-ink hover:bg-cream hover:text-forest">
              Book / Enquire
            </BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}
