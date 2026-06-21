import { recognition } from "@/content/site";

export function Recognition() {
  return (
    <section className="border-y border-sand bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:justify-center sm:gap-12">
        <span className="text-xs uppercase tracking-[0.25em] text-muted/70">
          Recognised by
        </span>
        {recognition.map((b) => (
          <div key={b} className="flex items-center gap-3">
            {/* Placeholder for official emblem */}
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 text-gold">
              ✦
            </span>
            <span className="max-w-[12rem] text-sm font-medium text-forest">
              {b}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
