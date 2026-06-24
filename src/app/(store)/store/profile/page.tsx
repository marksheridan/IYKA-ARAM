"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  slug: string;
  name: string;
  price: number;
  img: string;
  qty: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("iyka-user") || "null");
      if (!u) { router.replace("/store"); return; }
      setUser(u);
      setOrders(JSON.parse(localStorage.getItem("iyka-orders") || "[]"));
      const cart = JSON.parse(localStorage.getItem("iyka-cart") || "[]");
      setCartCount(cart.reduce((s: number, i: CartItem) => s + (i.qty || 1), 0));
    } catch {}
  }, [router]);

  function logout() {
    localStorage.removeItem("iyka-user");
    window.dispatchEvent(new Event("user-updated"));
    router.push("/store");
  }

  if (!user) return null;

  const masked = user.phone.replace(/(\+?\d+)(\d{4})$/, (_, _p, last4) => "•".repeat(6) + last4);

  return (
    <div style={{ minHeight: "60vh", background: "var(--cream)", padding: "3rem 1.5rem 6rem" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>
              My Account
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 300, color: "var(--dark)" }}>
              Welcome back
            </h1>
          </div>
          <button
            onClick={logout}
            style={{
              background: "none", border: "1px solid rgba(27,25,22,0.2)", color: "var(--dark-soft)",
              padding: "0.5rem 1.1rem", fontSize: "0.75rem", fontWeight: 500,
              letterSpacing: "0.06em", cursor: "pointer", borderRadius: "0.35rem",
              transition: "border-color 0.2s",
            }}
          >
            Sign out
          </button>
        </div>

        {/* Profile card */}
        <div style={{
          background: "#fff", border: "1px solid var(--cream-deep)", borderRadius: "0.75rem",
          padding: "1.5rem 1.75rem", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: "1.25rem",
        }}>
          <div style={{
            width: "3rem", height: "3rem", background: "var(--dark)", color: "#fff",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: "0.95rem", flexShrink: 0,
          }}>
            {user.phone.slice(-4)}
          </div>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.2rem" }}>Phone</p>
            <p style={{ fontSize: "1rem", color: "var(--dark)", fontWeight: 400 }}>{masked}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Orders placed", value: orders.length },
            { label: "Items in cart", value: cartCount },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", border: "1px solid var(--cream-deep)", borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
            }}>
              <p style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)", fontWeight: 300, color: "var(--dark)", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--dark-soft)", marginTop: "0.35rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 300, color: "var(--dark)", marginBottom: "1rem" }}>
            Order history
          </h2>
          {orders.length === 0 ? (
            <div style={{
              background: "#fff", border: "1px solid var(--cream-deep)", borderRadius: "0.75rem",
              padding: "2.5rem 1.5rem", textAlign: "center",
            }}>
              <p style={{ fontSize: "0.88rem", color: "var(--dark-soft)", marginBottom: "1rem" }}>No orders yet.</p>
              <Link href="/store" style={{
                display: "inline-block", background: "var(--dark)", color: "#fff",
                padding: "0.6rem 1.4rem", fontSize: "0.78rem", fontWeight: 500,
                letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
                borderRadius: "0.35rem",
              }}>
                Shop now
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {orders.map((o) => (
                <div key={o.id} style={{
                  background: "#fff", border: "1px solid var(--cream-deep)", borderRadius: "0.75rem",
                  padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.2rem" }}>Order #{o.id}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--dark-soft)" }}>{o.date} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.2rem" }}>₹{o.total.toLocaleString("en-IN")}</p>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--gold)", border: "1px solid var(--gold-pale)", padding: "0.1rem 0.5rem",
                    }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart shortcut */}
        {cartCount > 0 && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/store/cart" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "var(--gold)", color: "var(--dark)",
              padding: "0.75rem 2rem", fontSize: "0.82rem", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
              borderRadius: "0.35rem",
            }}>
              View cart ({cartCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
