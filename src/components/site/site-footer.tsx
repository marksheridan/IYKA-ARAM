import Image from "next/image";
import Link from "next/link";

const platform = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About Dr. Emidaka" },
  { href: "/store", label: "IYKA Living Store" },
  { href: "/store?tab=satwik", label: "Satwik Meals" },
  { href: "/blog", label: "Wellness Blog" },
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
                  <a href="#">{b}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="v2-footer-heading">Contact</p>
            <ul className="v2-footer-links">
              <li>
                <a href="tel:+919800000000">+91 98000 00000</a>
              </li>
              <li>
                <a href="mailto:hello@iyka-aram.com">hello@iyka-aram.com</a>
              </li>
              <li>
                <a href="https://instagram.com/iyka_aram" target="_blank" rel="noopener">
                  Instagram
                </a>
              </li>
              <li className="v2-footer-muted">Shillong, Meghalaya</li>
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
