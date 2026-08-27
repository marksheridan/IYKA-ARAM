import Link from "next/link";
import { BookButton } from "@/components/site/book-button";
import { Reveal } from "@/components/site/reveal";
import { services } from "@/content/services";

export const metadata = {
  title: "Services",
  description:
    "Acupuncture, naturopathy, yoga therapy, ozone therapy, functional medicine and nutrition, gut health resets, energy medicine, longevity, biohacking, massage and physiotherapy at IYKA-ARAM, Shillong.",
};

export default function ServicesPage() {
  return (
    <div className="v2-landing">
      {/* Hero — white, so the foliage band below reads as the page opening
          onto the planting rather than as a second decorative strip. */}
      <section className="svd-hero scroll-mt-20">
        <div className="v2-container">
          <p className="v2-section-label v2-reveal" style={{ marginBottom: "1rem" }}>
            What We Offer
          </p>
          <h1 className="svd-hero-title v2-reveal v2-reveal-1">
            Twelve ways to
            <br />
            <em>heal at the root.</em>
          </h1>
          <p className="svd-hero-lede v2-reveal v2-reveal-2">
            IYKA-ARAM is an integrative healthcare clinic — naturopathy and yoga,
            functional medicine, and evidence-based drugless therapies, delivered
            in Shillong and online. Each service below sets out what a course of
            treatment involves and what it is meant to leave you with.
          </p>
        </div>
      </section>

      {/* Service detail — the canopy is the section's own top edge, exactly
          as on the landing rail, so .svd-body carries no top padding. */}
      <section className="svd-body">
        <div className="sv-canopy" aria-hidden="true" />

        <div className="v2-container">
          {services.map((s) => (
            <article className="svd-row" key={s.num} id={s.slug}>
              <div className="svd-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imgWide} alt={s.alt} loading="lazy" decoding="async" />
              </div>

              <Reveal className="svd-content">
                <span className="svd-num">{s.num}</span>
                <h2 className="svd-name">{s.name}</h2>
                <p className="svd-summary">{s.summary}</p>

                <div className="svd-detail">
                  <div>
                    <p className="svd-sub">How it works</p>
                    <ol className="svd-list svd-list-num">
                      {s.how.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="svd-sub">Long-term benefits</p>
                    <ul className="svd-list svd-list-dot">
                      {s.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="v2-section-py" style={{ background: "var(--cream)", textAlign: "center" }}>
        <div className="v2-container">
          <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
            Not sure where to start?
          </p>
          <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", fontWeight: 700, marginBottom: "1.75rem" }}>
            Begin with a consultation.
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <BookButton
              interest="CONSULTATION"
              className="v2-btn v2-btn-gold bg-transparent text-[inherit]"
            >
              Book a Consultation
            </BookButton>
            <Link href="/contact" className="v2-btn v2-btn-outline-dark">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
