"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookButton } from "./book-button";
import { nav } from "@/content/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  /* Only the landing page puts a dark, full-bleed hero behind the bar, which
     is what the transparent state is for. Every other route starts against
     its own background — and several of those are light (/services opens
     white, /gallery and /about on cream) — where the cream nav links would
     be invisible until the first scroll. So inner pages get the solid bar
     from the top. */
  const solid = scrolled || pathname !== "/";

  // Solid dark bar after scrolling past the hero fold (matches Astro nav).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`v2-landing v2-nav ${solid ? "scrolled" : ""}`}>
      <div className="v2-nav-inner">
        <Link href="/" aria-label="IYKA-ARAM home" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="IYKA-ARAM"
            width={180}
            height={170}
            className="v2-nav-logo"
            priority
          />
        </Link>

        <ul className="v2-nav-links">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="v2-nav-link">
                {n.label}
              </Link>
            </li>
          ))}
          {/* Store link removed until launch — see store-teaser.tsx. Restore
              this <li> with the /store button when the shop goes live. */}
          <li>
            <BookButton className="v2-btn v2-btn-gold v2-nav-cta bg-transparent text-[inherit]">
              Book Now
            </BookButton>
          </li>
        </ul>

        <button
          className="v2-nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="v2-nav-mobile">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
          {/* Store link removed until launch — see store-teaser.tsx */}
          <BookButton className="v2-btn v2-btn-gold bg-transparent text-[inherit] mt-2 w-full justify-center">
            Book Now
          </BookButton>
        </nav>
      )}
    </header>
  );
}
