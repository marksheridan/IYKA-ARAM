import Image from "next/image";
import { BookButton } from "./book-button";
import { products } from "@/content/site";

export function ProductsTeaser() {
  return (
    <section id="products" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Products
            </p>
            <h2 className="mt-4 font-display text-3xl text-forest sm:text-4xl">
              Wellness, delivered pan-India
            </h2>
          </div>
          <span className="text-sm text-muted">Delivery across India</span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-2xl border border-sand bg-white"
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  width={400}
                  height={176}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 bg-gradient-to-br from-gold-soft to-sage/30" />
              )}
              <div className="p-6">
                <h3 className="font-display text-lg text-forest">{p.name}</h3>
                {p.desc && <p className="mt-1 text-sm text-muted">{p.desc}</p>}
                <div className="mt-1 text-sm text-muted">{p.price}</div>
                <BookButton
                  interest="PRODUCT"
                  className="mt-5 w-full border border-sage bg-transparent text-forest hover:bg-sand hover:text-forest"
                >
                  Enquire to order
                </BookButton>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Full online store with checkout is planned for a later phase.
        </p>
      </div>
    </section>
  );
}
