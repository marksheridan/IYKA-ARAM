"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookButton } from "./book-button";
import { nav } from "@/content/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Solid dark bar after scrolling past the hero fold (matches Astro nav).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`v2-landing v2-nav ${scrolled ? "scrolled" : ""}`}>
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
          <li>
            <BookButton className="v2-btn v2-btn-gold v2-nav-cta rounded-none bg-transparent text-[inherit]">
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
          <BookButton className="v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit] mt-2 w-full justify-center">
            Book Now
          </BookButton>
        </nav>
      )}
    </header>
  );
}
