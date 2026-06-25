"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CartItem {
  slug: string;
  name: string;
  price: number;
  img: string;
  size: string;
  qty: number;
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem("iyka-cart") || "[]"); } catch { return []; }
}
function saveCart(cart: CartItem[]) {
  localStorage.setItem("iyka-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}
function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
    const sync = () => setCart(getCart());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  function updateQty(idx: number, delta: number) {
    const c = [...cart];
    if (delta < 0 && c[idx].qty <= 1) {
      c.splice(idx, 1);
    } else {
      c[idx] = { ...c[idx], qty: c[idx].qty + delta };
    }
    saveCart(c);
    setCart(c);
  }

  function remove(idx: number) {
    const c = [...cart];
    c.splice(idx, 1);
    saveCart(c);
    setCart(c);
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 999 ? 0 : 99;
  const total = subtotal + delivery;

  if (!mounted) return null;

  return (
    <div className="store-container" style={{ padding: "0 2rem 5rem" }}>
      <nav className="store-breadcrumb">
        <Link href="/store">Store</Link>
        <span className="store-breadcrumb-sep">›</span>
        <span style={{ color: "var(--dark)" }}>Cart</span>
      </nav>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 300, marginBottom: "2.5rem" }}>
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 300, color: "rgba(27,25,22,0.3)", marginBottom: "1.5rem" }}>
            Your cart is empty.
          </p>
          <Link href="/store" className="btn-store-primary" style={{ display: "inline-flex", width: "auto", padding: "0.9rem 2.5rem" }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="store-cart-grid">
          {/* Items */}
          <div className="store-cart-items">
            {cart.map((item, idx) => (
              <div key={`${item.slug}-${idx}`} className="store-cart-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="store-cart-item-img" src={item.img} alt={item.name} />
                <div>
                  <p className="store-cart-item-name">{item.name}</p>
                  <p className="store-cart-item-size">{item.size}</p>
                  <p className="store-cart-item-price">{fmt(item.price)}</p>
                  <div className="store-cart-item-qty">
                    <button className="store-qty-btn-small" onClick={() => updateQty(idx, -1)}>−</button>
                    <span className="store-qty-num">{item.qty}</span>
                    <button className="store-qty-btn-small" onClick={() => updateQty(idx, 1)}>+</button>
                  </div>
                </div>
                <button className="store-remove-btn" onClick={() => remove(idx)}>Remove</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="store-cart-summary">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Order Summary
            </h2>
            <div className="store-summary-row">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="store-summary-row">
              <span>Delivery</span><span>{delivery === 0 ? "FREE" : fmt(delivery)}</span>
            </div>
            {delivery === 0 && (
              <p style={{ fontSize: "0.75rem", color: "var(--green)", marginBottom: "0.5rem" }}>✓ Free delivery applied</p>
            )}
            <div className="store-summary-row store-summary-total">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <Link href="/store/checkout" className="btn-store-primary" style={{ display: "flex", textDecoration: "none", marginBottom: "1rem" }}>
              Proceed to Checkout
            </Link>
            <Link href="/store" className="btn-store-outline" style={{ display: "flex", textDecoration: "none" }}>
              Continue Shopping
            </Link>
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--cream)", border: "1px solid var(--cream-deep)" }}>
              <p style={{ fontSize: "0.72rem", color: "rgba(27,25,22,0.55)", lineHeight: 1.7 }}>
                🔒 Secure checkout &nbsp;·&nbsp; 📦 Ships within 2–3 days &nbsp;·&nbsp; ↩️ 7-day returns
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
