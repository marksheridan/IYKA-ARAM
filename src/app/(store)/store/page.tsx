"use client";

import { useState } from "react";
import Link from "next/link";
import { products, categories } from "@/data/products";

function addToCart(item: { slug: string; name: string; price: number; img: string; size: string }) {
  const cart: { slug: string; qty: number }[] = JSON.parse(localStorage.getItem("iyka-cart") || "[]");
  const existing = cart.find((i) => i.slug === item.slug);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    (cart as unknown[]).push({ ...item, qty: 1 });
  }
  localStorage.setItem("iyka-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function StorePage() {
  const [active, setActive] = useState("All");
  const [added, setAdded] = useState<string | null>(null);

  const visible = products.filter((p) => active === "All" || p.category === active);

  function handleAdd(p: typeof products[0]) {
    addToCart({ slug: p.slug, name: p.name, price: p.price, img: p.img, size: p.size });
    setAdded(p.slug);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <>
      {/* Hero */}
      <section style={{ background: "var(--dark)", color: "var(--cream)", padding: "5rem 2rem 4rem" }}>
        <div className="store-container">
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem" }}>
            Iyka-Aram · IYKA Living
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: "1rem" }}>
            Wellness you can<br /><em style={{ color: "var(--gold)" }}>hold in your hands.</em>
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(248,244,238,0.65)", maxWidth: "36rem", lineHeight: 1.7 }}>
            Every product formulated by Dr. Emidaka and her clinical team — pure ingredients, therapeutic intent, zero compromise.
          </p>
        </div>
      </section>

      {/* Filter + Grid */}
      <section style={{ padding: "3rem 2rem 5rem" }}>
        <div className="store-container">
          <div className="store-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`store-filter-btn${active === cat ? " active" : ""}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="store-products-grid">
            {visible.map((p) => (
              <article key={p.slug} className="store-product-card">
                <Link href={`/store/${p.slug}`} className="store-product-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} loading="lazy" />
                  {p.badge && <span className="store-product-badge">{p.badge}</span>}
                  {p.mrp > p.price && (
                    <span className="store-product-discount">−{Math.round((1 - p.price / p.mrp) * 100)}%</span>
                  )}
                </Link>
                <div className="store-product-info">
                  <span className="store-product-cat">{p.category}</span>
                  <Link href={`/store/${p.slug}`}>
                    <h2 className="store-product-name">{p.name}</h2>
                  </Link>
                  <p className="store-product-tagline">{p.tagline}</p>
                  <div className="store-product-price-row">
                    <span className="store-price-current">₹{p.price.toLocaleString("en-IN")}</span>
                    {p.mrp > p.price && <span className="store-price-mrp">₹{p.mrp.toLocaleString("en-IN")}</span>}
                  </div>
                  <div className="store-product-rating">
                    <span className="store-stars">{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}</span>
                    <span className="store-rating-count">({p.reviews})</span>
                  </div>
                  <button
                    className={`store-add-to-cart-btn${added === p.slug ? " added" : ""}`}
                    onClick={() => handleAdd(p)}
                  >
                    {added === p.slug ? "✓ Added" : "Add to Cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: "var(--cream-mid)", padding: "2.5rem 2rem", borderTop: "1px solid var(--cream-deep)" }}>
        <div className="store-container">
          <div className="store-trust-bar">
            {[
              { icon: "🌿", text: "All Natural Ingredients" },
              { icon: "🧪", text: "Clinically Formulated" },
              { icon: "📦", text: "Pan-India Delivery" },
              { icon: "↩️", text: "7-Day Easy Returns" },
            ].map((t) => (
              <div key={t.text} className="store-trust-item">
                <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.05em" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
