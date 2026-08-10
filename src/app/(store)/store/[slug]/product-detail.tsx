"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/generated/prisma/client";

function addToCartItem(slug: string, name: string, price: number, img: string, size: string, qty: number) {
  const cart: { slug: string; name: string; price: number; img: string; size: string; qty: number }[] =
    JSON.parse(localStorage.getItem("iyka-cart") || "[]");
  const existing = cart.find((i) => i.slug === slug);
  if (existing) {
    existing.qty = (existing.qty || 1) + qty;
  } else {
    cart.push({ slug, name, price, img, size, qty });
  }
  localStorage.setItem("iyka-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

const TABS = ["description", "benefits", "ingredients", "usage"] as const;
type Tab = typeof TABS[number];

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [addedMsg, setAddedMsg] = useState("");

  const price = Number(product.price);
  const mrp = product.mrp ? Number(product.mrp) : price;
  const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const img = product.images[0] ?? "";

  function handleAddToCart() {
    addToCartItem(product.slug, product.name, price, img, product.size ?? "", qty);
    setAddedMsg(`✓ ${qty > 1 ? qty + "× " : ""}Added to Cart`);
    setTimeout(() => setAddedMsg(""), 2000);
  }

  function handleBuyNow() {
    addToCartItem(product.slug, product.name, price, img, product.size ?? "", qty);
    router.push("/store/checkout");
  }

  return (
    <div className="store-container" style={{ padding: "0 2rem 5rem" }}>
      <nav className="store-breadcrumb">
        <Link href="/store">Store</Link>
        <span className="store-breadcrumb-sep">›</span>
        <Link href="/store">{product.category}</Link>
        <span className="store-breadcrumb-sep">›</span>
        <span style={{ color: "var(--dark)" }}>{product.name}</span>
      </nav>

      <div className="store-detail-grid">
        {/* Image */}
        <div className="store-detail-image-wrap">
          <div className="store-detail-image-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={product.name} />
            {product.badge && <span className="store-detail-badge">{product.badge}</span>}
          </div>
          {discount > 0 && (
            <div className="store-detail-saving">
              Save ₹{(mrp - price).toLocaleString("en-IN")} ({discount}% off)
            </div>
          )}
        </div>

        {/* Info */}
        <div className="store-detail-info">
          <span className="store-detail-cat">{product.category}</span>
          <h1 className="store-detail-name">{product.name}</h1>
          {product.tagline && <p className="store-detail-tagline">{product.tagline}</p>}

          {product.rating && (
            <div className="store-detail-rating">
              <span className="store-stars">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{product.rating}</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(27,25,22,0.4)" }}>({product.reviews ?? 0} reviews)</span>
            </div>
          )}

          <div className="store-detail-price-block">
            <span className="store-detail-price">₹{price.toLocaleString("en-IN")}</span>
            {discount > 0 && <span className="store-detail-mrp">MRP ₹{mrp.toLocaleString("en-IN")}</span>}
            {discount > 0 && <span className="store-detail-discount-tag">{discount}% OFF</span>}
          </div>

          {product.size && (
            <p className="store-detail-size-label">Size: <strong>{product.size}</strong></p>
          )}

          {product.inStock ? (
            <>
              <div className="store-detail-qty-row">
                <label style={{ fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", color: "rgba(27,25,22,0.55)" }}>QTY</label>
                <div className="store-qty-control">
                  <button className="store-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="store-qty-val">{qty}</span>
                  <button className="store-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
              </div>
              <div className="store-detail-actions">
                <button
                  className="btn-store-primary"
                  onClick={handleAddToCart}
                  style={addedMsg ? { background: "var(--green)" } : {}}
                >
                  {addedMsg || (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <button className="btn-store-gold" onClick={handleBuyNow}>Buy Now</button>
              </div>
            </>
          ) : (
            <button className="btn-store-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
              Out of Stock
            </button>
          )}

          <div className="store-trust-chips">
            {["🌿 100% Natural", "🧪 Dr. Formulated", "📦 Free shipping ₹999+", "↩️ 7-day returns"].map((t) => (
              <span key={t} className="store-trust-chip">{t}</span>
            ))}
          </div>

          <div className="store-detail-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`store-tab-btn${activeTab === t ? " active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "usage" ? "How to Use" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="store-tab-panel">
            {activeTab === "description" && (
              <p style={{ lineHeight: 1.8, color: "rgba(27,25,22,0.75)" }}>{product.description}</p>
            )}
            {activeTab === "benefits" && (
              <ul className="store-benefits-list">
                {product.benefits.map((b) => (
                  <li key={b}>
                    <svg width="14" height="14" fill="none" stroke="var(--green)" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "ingredients" && (
              <p style={{ lineHeight: 1.8, color: "rgba(27,25,22,0.75)" }}>{product.ingredients}</p>
            )}
            {activeTab === "usage" && (
              <p style={{ lineHeight: 1.8, color: "rgba(27,25,22,0.75)" }}>{product.usage}</p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: "5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "2rem" }}>
            You may also like
          </h2>
          <div className="store-related-grid">
            {related.map((r) => (
              <Link key={r.slug} href={`/store/${r.slug}`} className="store-related-card">
                <div className="store-related-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.images[0] ?? ""} alt={r.name} loading="lazy" />
                </div>
                <div style={{ padding: "1rem" }}>
                  <p className="store-product-cat">{r.category}</p>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 400 }}>{r.name}</h3>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, marginTop: "0.4rem" }}>
                    ₹{Number(r.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
