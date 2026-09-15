import Image from "next/image";

/* Shares the hero's photograph so the holding page reads as the same brand the
   full site will — not a placeholder bolted on in front of it. */
const heroImage = "/hero.png";

export function ComingSoon() {
  return (
    <div className="v2-landing">
      <section className="v2-hero cs-hero" aria-label="Launching soon">
        <div className="v2-hero-bg">
          <div
            className="v2-hero-slide is-active"
            style={{ backgroundImage: `url('${heroImage}')` }}
            aria-hidden="true"
          />
          <div className="v2-hero-overlay" aria-hidden="true" />
          <div className="v2-hero-grain" aria-hidden="true" />
        </div>

        <div className="v2-hero-content">
          <div className="v2-hero-copy">
            <Image
              src="/logo.png"
              alt="IYKA-ARAM Wellness"
              width={150}
              height={142}
              priority
              className="cs-logo v2-reveal"
            />

            <p className="v2-hero-kicker v2-reveal v2-reveal-1">
              <span className="v2-hero-kicker-rule" aria-hidden="true" />
              Shillong · Meghalaya
            </p>

            <h1 className="v2-hero-title v2-reveal v2-reveal-2">
              Launching <em>soon.</em>
            </h1>

            <p className="v2-hero-sub cs-sub v2-reveal v2-reveal-3">
              Clinical wellness, rooted in nature.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
