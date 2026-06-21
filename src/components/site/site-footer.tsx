import Link from "next/link";
import { business } from "@/content/site";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-sand bg-forest text-cream/90"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl">
            IYKA<span className="text-gold">-</span>ARAM
          </div>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Clinical wellness in Northeast India. Functional Medicine, Yoga &amp;
            Naturopathy — drugless, integrative healthcare.
          </p>
          <p className="mt-4 font-display text-base text-gold">
            {business.tagline}
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/60">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>{business.location}</li>
            <li>
              <a href={business.phoneHref} className="hover:text-gold">
                {business.phone}
              </a>
            </li>
            <li>
              <a
                href={business.whatsappHref}
                className="hover:text-gold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="hover:text-gold">
                {business.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/60">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>
              <Link href="/#mission" className="hover:text-gold">
                Our Mission
              </Link>
            </li>
            <li>
              <Link href="/#services" className="hover:text-gold">
                Services
              </Link>
            </li>
            <li>
              <Link href="/#products" className="hover:text-gold">
                Products
              </Link>
            </li>
            <li>
              <Link href="/#team" className="hover:text-gold">
                Our Team
              </Link>
            </li>
          </ul>
          <div className="mt-5 flex gap-4 text-sm text-cream/80">
            {business.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </span>
          <span>
            Recognised by the Ministry of AYUSH &amp; Ministry of Education,
            Govt. of India.
          </span>
        </div>
      </div>
    </footer>
  );
}
