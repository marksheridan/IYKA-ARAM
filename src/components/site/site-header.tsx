"use client";

import Link from "next/link";
import { useState } from "react";
import { BookButton } from "./book-button";
import { nav } from "@/content/site";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand/70 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-forest"
          onClick={() => setMenuOpen(false)}
        >
          IYKA<span className="text-gold">-</span>ARAM
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <BookButton className="hidden sm:inline-flex" />
          <button
            className="rounded-lg p-2 text-forest md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-sand bg-cream px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-muted">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="transition-colors hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
            <BookButton className="mt-2 w-full" />
          </div>
        </nav>
      )}
    </header>
  );
}
