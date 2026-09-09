import { ContactSection } from "@/components/site/contact-section";
import { LocationSection } from "@/components/site/location-section";
import { business } from "@/content/site";

export const metadata = {
  title: "Contact",
  description: `Get in touch with IYKA-ARAM Wellness — ${business.addressShort}. Call ${business.phone} or send an enquiry about functional medicine, naturopathy and yoga therapy.`,
};

export default function ContactPage() {
  return (
    <div className="v2-landing">
      {/* Slim page header — deliberately lighter than the services hero so it
          reads as a page title rather than competing with the form heading. */}
      <section style={{ background: "var(--green)", padding: "10rem 0 4rem" }}>
        <div className="v2-container" style={{ textAlign: "center" }}>
          <p
            className="v2-section-label v2-reveal"
            style={{ color: "var(--gold-light)", marginBottom: "1rem" }}
          >
            Contact
          </p>
          <h1
            className="v2-reveal v2-reveal-1"
            style={{
              fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)",
              color: "var(--cream)",
              fontWeight: 700,
              lineHeight: 1.03,
            }}
          >
            Let&apos;s talk.
          </h1>
        </div>
      </section>

      <ContactSection />
      <LocationSection />
    </div>
  );
}
