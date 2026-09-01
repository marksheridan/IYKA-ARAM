import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/site";

/* Store links are removed until the shop launches — restore
   { href: "/store", label: "IYKA Living Store" } here when it goes live. */
const platform = [
  { href: "/#services", label: "Services" },
  { href: "/#pillars", label: "The 5 Pillars" },
  { href: "/#about", label: "About Dr. Emidaka" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Wellness Blog" },
  { href: "/podcast", label: "The Podcast" },
];

const brands = ["IYKA Learn", "IYKA Circle", "IYKA Therapies", "IYKA Living", "IYKA Roots Foundation"];

export function SiteFooter() {
  return (
    <footer className="v2-landing v2-footer">
      <div className="v2-container">
        <div className="v2-footer-grid">
          {/* Brand */}
          <div>
            <Image src="/logo.png" alt="IYKA-ARAM" width={180} height={170} className="v2-footer-logo" />
            <p className="v2-footer-blurb">
              Northeast India&apos;s first functional medicine startup. Clinical
              wellness. The drugless healthcare.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="v2-footer-heading">Platform</p>
            <ul className="v2-footer-links">
              {platform.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sub-brands */}
          <div>
            <p className="v2-footer-heading">IYKA Brands</p>
            <ul className="v2-footer-links">
              {brands.map((b) => (
                <li key={b}>
                  <Link href="/#pillars">{b}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="v2-footer-heading">Contact</p>
            <ul className="v2-footer-links">
              <li>
                <a href={business.phoneHref}>{business.phone}</a>
              </li>
              <li>
                <a href={business.emailHref}>{business.email}</a>
              </li>
              {business.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener">
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="v2-footer-muted">{business.addressShort}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="v2-footer-bottom">
          <p>© {new Date().getFullYear()} IYKA-ARAM Wellness &amp; Healthcare. All rights reserved.</p>
          <div className="v2-footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
