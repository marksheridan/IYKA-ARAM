"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BookButton } from "./book-button";
import { hero } from "@/content/site";

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % hero.lines.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: real hero photo if provided, otherwise a soft Meghalaya-hills gradient. */}
      <div className="absolute inset-0 -z-10">
        {hero.backgroundImage ? (
          <>
            <Image
              src={hero.backgroundImage}
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-cream/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-sand" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(124,139,111,0.18),transparent)]" />
          </>
        )}
      </div>

      <div className="mx-auto flex min-h-[86vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">
          {hero.kicker}
        </p>

        <h1 className="mt-6 font-display text-4xl leading-[1.1] text-forest sm:text-6xl md:text-7xl">
          {hero.heading}
        </h1>

        <p
          key={index}
          className="animate-fade-in-up mt-6 h-7 text-lg text-muted sm:text-xl"
        >
          {hero.lines[index]}
        </p>

        <p className="mt-6 max-w-2xl text-base text-muted/90">{hero.subcopy}</p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <BookButton
            interest="CONSULTATION"
            className="bg-gold px-8 py-3.5 text-base text-ink hover:bg-forest hover:text-cream"
          >
            Book a Consultation
          </BookButton>
          <a
            href="#services"
            className="rounded-full border border-sage px-8 py-3.5 text-base text-forest transition-colors hover:bg-sand"
          >
            Explore Services
          </a>
        </div>

        <div className="mt-16 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted/70">
          <span className="h-px w-8 bg-sage/50" />
          Scroll to discover
        </div>
      </div>
    </section>
  );
}
