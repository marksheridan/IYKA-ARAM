"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";

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

export function StoreGrid({ products, categories }: { products: Product[]; categories: string[] }) {
  const [active, setActive] = useState("All");
  const [added, setAdded] = useState<string | null>(null);

  const visible = products.filter((p) => active === "All" || p.category === active);

  function handleAdd(p: Product) {
    addToCart({
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      img: p.images[0] ?? "",
      size: p.size ?? "",
    });
    setAdded(p.slug);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
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
          {visible.map((p) => {
            const price = Number(p.price);
            const mrp = p.mrp ? Number(p.mrp) : price;
            const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
            const img = p.images[0] ?? "";
            const rating = p.rating ?? 0;
            return (
              <article key={p.slug} className="store-product-card">
                <Link href={`/store/${p.slug}`} className="store-product-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={p.name} loading="lazy" />
                  {p.badge && <span className="store-product-badge">{p.badge}</span>}
                  {discount > 0 && <span className="store-product-discount">−{discount}%</span>}
                </Link>
                <div className="store-product-info">
                  <span className="store-product-cat">{p.category}</span>
                  <Link href={`/store/${p.slug}`}>
                    <h2 className="store-product-name">{p.name}</h2>
                  </Link>
                  <p className="store-product-tagline">{p.tagline}</p>
                  <div className="store-product-price-row">
                    <span className="store-price-current">₹{price.toLocaleString("en-IN")}</span>
                    {discount > 0 && <span className="store-price-mrp">₹{mrp.toLocaleString("en-IN")}</span>}
                  </div>
                  {rating > 0 && (
                    <div className="store-product-rating">
                      <span className="store-stars">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
                      <span className="store-rating-count">({p.reviews ?? 0})</span>
                    </div>
                  )}
                  {p.inStock ? (
                    <button
                      className={`store-add-to-cart-btn${added === p.slug ? " added" : ""}`}
                      onClick={() => handleAdd(p)}
                    >
                      {added === p.slug ? "✓ Added" : "Add to Cart"}
                    </button>
                  ) : (
                    <button className="store-add-to-cart-btn" disabled style={{ opacity: 0.5 }}>
                      Out of Stock
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
