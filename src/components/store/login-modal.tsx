"use client";

import { useEffect, useRef, useState } from "react";

type Step = "phone" | "otp" | "done";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: (phone: string) => void;
}

export function LoginModal({ open, onClose, onLogin }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setStep("phone"); setPhone(""); setOtp(""); setError(""); }
  }, [open]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }
      setToken(data.token);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) { setError(data.error || "Incorrect OTP."); return; }
      onLogin(phone);
      setStep("done");
      setTimeout(onClose, 900);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "done" ? (
          <div className="py-4 text-center">
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✓</div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--dark)" }}>
              Welcome back!
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>
                IYKA Living
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 300, color: "var(--dark)" }}>
                {step === "phone" ? "Sign in" : "Enter OTP"}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--dark-soft)", marginTop: "0.3rem" }}>
                {step === "phone"
                  ? "We'll send a one-time code to your phone."
                  : `Code sent to ${phone}. Valid for 10 minutes.`}
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.35rem" }}>
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    required
                    autoFocus
                    style={{
                      width: "100%", border: "1px solid #e2ddd6", borderRadius: "0.5rem",
                      padding: "0.65rem 0.9rem", fontSize: "0.9rem", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {error && <p style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "var(--dark)", color: "#fff", border: "none",
                    padding: "0.75rem", fontSize: "0.85rem", fontWeight: 500,
                    letterSpacing: "0.06em", cursor: "pointer", borderRadius: "0.5rem",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.35rem" }}>
                    6-digit code
                  </label>
                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    required
                    style={{
                      width: "100%", border: "1px solid #e2ddd6", borderRadius: "0.5rem",
                      padding: "0.65rem 0.9rem", fontSize: "1.4rem", letterSpacing: "0.4em",
                      outline: "none", textAlign: "center", boxSizing: "border-box",
                    }}
                  />
                </div>
                {error && <p style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "var(--gold)", color: "var(--dark)", border: "none",
                    padding: "0.75rem", fontSize: "0.85rem", fontWeight: 600,
                    letterSpacing: "0.06em", cursor: "pointer", borderRadius: "0.5rem",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Verifying…" : "Verify & Sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  style={{ background: "none", border: "none", fontSize: "0.78rem", color: "var(--dark-soft)", cursor: "pointer" }}
                >
                  ← Change number
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
