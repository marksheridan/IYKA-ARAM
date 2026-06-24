"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { LoginModal } from "@/components/store/login-modal";

function getUser(): { phone: string } | null {
  try { return JSON.parse(localStorage.getItem("iyka-user") || "null"); } catch { return null; }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());

    function updateCart() {
      try {
        const cart = JSON.parse(localStorage.getItem("iyka-cart") || "[]");
        setCartCount(cart.reduce((s: number, i: { qty?: number }) => s + (i.qty || 1), 0));
      } catch {}
    }
    updateCart();
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  function handleLogin(phone: string) {
    const u = { phone };
    localStorage.setItem("iyka-user", JSON.stringify(u));
    setUser(u);
    window.dispatchEvent(new Event("user-updated"));
  }

  const initials = user ? user.phone.slice(-4) : null;

  return (
    <>
      <nav className="store-nav">
        <div className="store-nav-inner">
          <Link href="/store" className="store-logo">
            <span className="store-logo-brand">IYKA Living</span>
            <span className="store-logo-sub">Wellness Store</span>
          </Link>
          <ul className="store-nav-links">
            <li><Link href="/store" className="store-nav-link">Products</Link></li>
            <li><Link href="/store/orders" className="store-nav-link">My Orders</Link></li>
            <li><Link href="/store/track" className="store-nav-link">Track Order</Link></li>
            <li>
              <Link
                href="/store/cart"
                aria-label="Cart"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2.4rem",
                  height: "2.4rem",
                  border: "1.5px solid #C8973C",
                  color: "#C8973C",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <svg width="17" height="17" fill="none" stroke="#C8973C" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-0.4rem",
                    right: "-0.4rem",
                    background: "#1B1916",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: "1.1rem",
                    height: "1.1rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              {user ? (
                <Link
                  href="/store/profile"
                  aria-label="My profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.4rem",
                    height: "2.4rem",
                    background: "#1B1916",
                    border: "1.5px solid #1B1916",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </Link>
              ) : (
                <button
                  aria-label="Sign in"
                  onClick={() => setLoginOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.4rem",
                    height: "2.4rem",
                    background: "none",
                    border: "1.5px solid #C8973C",
                    color: "#C8973C",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <svg width="17" height="17" fill="none" stroke="#C8973C" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <main>{children}</main>

      <SiteFooter />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}
