"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface CartItem { slug: string; name: string; price: number; img: string; size: string; qty: number; }

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem("iyka-cart") || "[]"); } catch { return []; }
}
function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

type PayMethod = "upi" | "bank" | "cod";
type OtpStep = 1 | 2 | 3;

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [payment, setPayment] = useState<PayMethod>("upi");
  const [formError, setFormError] = useState("");

  // OTP modal
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<OtpStep>(1);
  const [otpToken, setOtpToken] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSendError, setOtpSendError] = useState("");
  const [otpVerifyError, setOtpVerifyError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [maskedPhone, setMaskedPhone] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 999 ? 0 : 99;
  const codCharge = payment === "cod" ? 30 : 0;
  const total = subtotal + delivery + codCharge;

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!phone.trim() || !/^[0-9+\s]{10,15}$/.test(phone)) return "Please enter a valid phone number.";
    if (!street.trim()) return "Please enter your street address.";
    if (!city.trim()) return "Please enter your city.";
    if (!state.trim()) return "Please enter your state.";
    if (!/^[0-9]{6}$/.test(pin)) return "Please enter a valid 6-digit PIN code.";
    return null;
  }

  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(600);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function fmtCountdown(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  async function sendOtp() {
    setOtpLoading(true);
    setOtpSendError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to send OTP.");
      setOtpToken(data.token);
      setMaskedPhone(`****${data.maskedPhone}`);
      setOtpDigits(["", "", "", "", "", ""]);
      startCountdown();
      setOtpStep(2);
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    } catch (e: unknown) {
      setOtpSendError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp() {
    const otp = otpDigits.join("");
    if (otp.length < 6) { setOtpVerifyError("Please enter the complete 6-digit OTP."); return; }
    setOtpLoading(true);
    setOtpVerifyError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, otp }),
      });
      const data = await res.json();
      if (!data.verified) throw new Error(data.error || "Incorrect OTP.");
      setOtpStep(3);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setTimeout(() => placeOrder(), 1200);
    } catch (e: unknown) {
      setOtpVerifyError(e instanceof Error ? e.message : "Verification failed.");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => digitRefs.current[0]?.focus(), 50);
    } finally {
      setOtpLoading(false);
    }
  }

  function placeOrder() {
    const id = "IYKA" + Date.now().toString().slice(-8);
    const order = { id, date: new Date().toISOString(), items: cart, name, phone, email, street, city, state, pin, payment, subtotal, delivery, codCharge, total, status: "Order Placed" };
    const orders = JSON.parse(localStorage.getItem("iyka-orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("iyka-orders", JSON.stringify(orders));
    localStorage.removeItem("iyka-cart");
    window.dispatchEvent(new Event("cart-updated"));
    setOtpOpen(false);
    setOrderId(id);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDigit(idx: number, val: string) {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = clean;
    setOtpDigits(next);
    if (clean && idx < 5) digitRefs.current[idx + 1]?.focus();
  }

  function handleDigitKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) digitRefs.current[idx - 1]?.focus();
    if (e.key === "Enter" && otpStep === 2) verifyOtp();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    digitRefs.current[Math.min(text.length, 5)]?.focus();
  }

  if (!mounted) return null;

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ width: "5rem", height: "5rem", background: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 300, marginBottom: "1rem" }}>Order Placed!</h1>
          <p style={{ color: "rgba(27,25,22,0.6)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
            Thank you for your order. Your order ID is <strong>{orderId}</strong>.
          </p>
          <p style={{ color: "rgba(27,25,22,0.6)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            You&rsquo;ll receive a WhatsApp confirmation within 30 minutes. Expected delivery: 3–5 business days.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/store" className="btn-store-outline" style={{ display: "inline-flex", width: "auto" }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 300, color: "rgba(27,25,22,0.3)", marginBottom: "1.5rem" }}>Your cart is empty.</p>
        <Link href="/store" className="btn-store-primary" style={{ display: "inline-flex", width: "auto", padding: "0.9rem 2.5rem" }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <>
      <div className="store-container" style={{ padding: "0 2rem" }}>
        <nav className="store-breadcrumb">
          <Link href="/store">Store</Link>
          <span className="store-breadcrumb-sep">›</span>
          <Link href="/store/cart">Cart</Link>
          <span className="store-breadcrumb-sep">›</span>
          <span style={{ color: "var(--dark)" }}>Checkout</span>
        </nav>
      </div>

      <div className="store-checkout-grid">
        {/* Form */}
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 300, marginBottom: "2rem" }}>Checkout</h1>

          <div className="store-checkout-section">
            <h2 className="store-checkout-section-title">Contact &amp; Delivery</h2>
            <div className="store-form-grid">
              <div className="store-field-group">
                <label className="store-field-label">Full Name *</label>
                <input className="store-field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="store-field-group">
                <label className="store-field-label">WhatsApp Number *</label>
                <input className="store-field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98000 00000" />
              </div>
              <div className="store-field-group" style={{ gridColumn: "1/-1" }}>
                <label className="store-field-label">Email Address</label>
                <input className="store-field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="store-field-group" style={{ gridColumn: "1/-1" }}>
                <label className="store-field-label">Street Address *</label>
                <input className="store-field-input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="House / Flat / Street" />
              </div>
              <div className="store-field-group">
                <label className="store-field-label">City *</label>
                <input className="store-field-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Shillong" />
              </div>
              <div className="store-field-group">
                <label className="store-field-label">State *</label>
                <input className="store-field-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="Meghalaya" />
              </div>
              <div className="store-field-group">
                <label className="store-field-label">PIN Code *</label>
                <input className="store-field-input" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="793001" maxLength={6} />
              </div>
            </div>
          </div>

          <div className="store-checkout-section">
            <h2 className="store-checkout-section-title">Payment</h2>
            <div className="store-payment-options">
              {(["upi", "bank", "cod"] as PayMethod[]).map((m) => (
                <label key={m} className={`store-payment-opt${payment === m ? " checked" : ""}`}>
                  <input type="radio" name="payment" value={m} checked={payment === m} onChange={() => setPayment(m)} style={{ accentColor: "var(--gold)" }} />
                  <div className="store-payment-opt-content">
                    <span className="store-payment-icon">{m === "upi" ? "📱" : m === "bank" ? "🏦" : "💵"}</span>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        {m === "upi" ? "UPI / QR Code" : m === "bank" ? "Bank Transfer (NEFT/IMPS)" : "Cash on Delivery"}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "rgba(27,25,22,0.5)" }}>
                        {m === "upi" ? "Pay via PhonePe, GPay, Paytm or any UPI app" : m === "bank" ? "Transfer directly to our account" : "Pay when your order arrives (₹30 COD charge)"}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {payment === "upi" && (
              <div className="store-payment-detail-box">
                <p style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>UPI Details</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>UPI ID: <strong>iyka.aram@upi</strong></p>
                <p style={{ fontSize: "0.75rem", color: "rgba(27,25,22,0.5)" }}>Send payment and attach the screenshot to your WhatsApp confirmation.</p>
              </div>
            )}
            {payment === "bank" && (
              <div className="store-payment-detail-box">
                <p style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Bank Details</p>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>
                  Account Name: <strong>Iyka-Aram Wellness Pvt Ltd</strong><br />
                  Account No: <strong>XXXX XXXX 1234</strong><br />
                  IFSC: <strong>SBIN0001234</strong><br />
                  Bank: State Bank of India
                </p>
              </div>
            )}
            {payment === "cod" && (
              <div className="store-payment-detail-box">
                <p style={{ fontSize: "0.85rem", color: "rgba(27,25,22,0.65)", lineHeight: 1.7 }}>
                  Cash on Delivery is available. A ₹30 handling charge will be added to your order total.
                </p>
              </div>
            )}
          </div>

          {formError && (
            <div style={{ background: "#fff0f0", border: "1px solid #f5c6cb", color: "#721c24", padding: "0.8rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {formError}
            </div>
          )}

          <button
            className="btn-store-primary"
            style={{ fontSize: "0.9rem" }}
            onClick={() => {
              const err = validate();
              if (err) { setFormError(err); return; }
              setFormError("");
              setOtpStep(1);
              setOtpSendError("");
              setOtpOpen(true);
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Verify &amp; Place Order
          </button>
        </div>

        {/* Sidebar */}
        <div className="store-checkout-sidebar">
          <div className="store-sidebar-box">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.2rem" }}>Order Summary</h2>
            {cart.map((i) => (
              <div key={i.slug} className="store-sidebar-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.img} alt={i.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.83rem", fontWeight: 500, lineHeight: 1.3 }}>{i.name}</p>
                  <p style={{ fontSize: "0.73rem", color: "rgba(27,25,22,0.45)" }}>{i.size} · Qty {i.qty}</p>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(i.price * i.qty)}</p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--cream-deep)", marginTop: "1rem", paddingTop: "1rem" }}>
              <div className="store-summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="store-summary-row"><span>Delivery</span><span>{delivery === 0 ? "FREE" : fmt(delivery)}</span></div>
              {payment === "cod" && <div className="store-summary-row" style={{ color: "rgba(27,25,22,0.55)" }}><span>COD charge</span><span>₹30</span></div>}
              <div className="store-summary-row store-summary-total"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpOpen && (
        <div
          className="store-otp-modal"
          onClick={(e) => { if (e.target === e.currentTarget) setOtpOpen(false); }}
        >
          <div className="store-otp-card">
            {otpStep === 1 && (
              <>
                <div className="store-otp-icon">📱</div>
                <h2 className="store-otp-title">Verify Your Phone</h2>
                <p className="store-otp-subtitle">We&rsquo;ll send a 6-digit OTP to confirm your order.</p>
                <div className="store-otp-phone-display">
                  <span style={{ fontSize: "0.75rem", color: "rgba(27,25,22,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Sending OTP to</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--dark)" }}>{phone}</span>
                </div>
                {otpSendError && <div className="store-otp-error">{otpSendError}</div>}
                <button className="btn-store-primary" onClick={sendOtp} disabled={otpLoading}>
                  {otpLoading ? "Sending…" : "Send OTP"}
                </button>
                <button className="store-otp-cancel-btn" onClick={() => setOtpOpen(false)}>Cancel</button>
              </>
            )}

            {otpStep === 2 && (
              <>
                <div className="store-otp-icon">🔐</div>
                <h2 className="store-otp-title">Enter OTP</h2>
                <p className="store-otp-subtitle">Enter the 6-digit code sent to <strong>{maskedPhone}</strong></p>
                <div className="store-otp-input-row" onPaste={handlePaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { digitRefs.current[i] = el; }}
                      className={`store-otp-digit${d ? " filled" : ""}`}
                      maxLength={1}
                      inputMode="numeric"
                      value={d}
                      onChange={(e) => handleDigit(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKey(i, e)}
                    />
                  ))}
                </div>
                <p className="store-otp-timer">
                  OTP expires in <strong>{fmtCountdown(countdown)}</strong>
                </p>
                {otpVerifyError && <div className="store-otp-error">{otpVerifyError}</div>}
                <button className="btn-store-primary" onClick={verifyOtp} disabled={otpLoading || countdown === 0}>
                  {otpLoading ? "Verifying…" : "Verify & Place Order"}
                </button>
                <button className="store-otp-cancel-btn" onClick={() => setOtpStep(1)}>
                  Didn&rsquo;t receive it? <span style={{ color: "var(--gold)", textDecoration: "underline" }}>Resend</span>
                </button>
              </>
            )}

            {otpStep === 3 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "4rem", height: "4rem", background: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" }}>
                  <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="store-otp-title">Verified!</h2>
                <p className="store-otp-subtitle">Placing your order…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
