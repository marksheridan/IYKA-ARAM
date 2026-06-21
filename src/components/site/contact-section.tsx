"use client";

import { useActionState } from "react";
import { submitLead, type LeadState } from "@/app/(site)/actions";
import { Reveal } from "./reveal";

export function ContactSection() {
  const [state, formAction, isPending] = useActionState<LeadState, FormData>(
    submitLead,
    null,
  );

  return (
    <section
      id="contact"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream-deep)" }}
    >
      <div className="v2-container">
        <div className="v2-contact-grid">
          {/* Left: intro + contact links */}
          <Reveal>
            <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
              Get In Touch
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: "1.5rem" }}>
              Your wellness journey
              <br />
              <em style={{ color: "var(--gold)" }}>starts with a conversation.</em>
            </h2>
            <p style={{ color: "var(--dark-soft)", lineHeight: 1.8, marginBottom: "2.5rem" }}>
              Whether you&apos;re seeking answers to a chronic health issue, looking
              to transform your relationship with food, or wanting to deepen your
              yoga practice — we&apos;re here to listen.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <a href="tel:+919800000000" className="v2-contact-link">
                <span className="v2-contact-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <span>+91 98000 00000</span>
              </a>
              <a href="mailto:hello@iyka-aram.com" className="v2-contact-link">
                <span className="v2-contact-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                <span>hello@iyka-aram.com</span>
              </a>
              <a href="https://instagram.com/iyka_aram" target="_blank" rel="noopener" className="v2-contact-link">
                <span className="v2-contact-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </span>
                <span>@iyka_aram</span>
              </a>
              <div className="v2-contact-link" style={{ cursor: "default" }}>
                <span className="v2-contact-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                <span>Shillong, Meghalaya 793001, India</span>
              </div>
            </div>
          </Reveal>

          {/* Right: enquiry form (wired to submitLead) */}
          <Reveal delay={0.2} className="v2-contact-form-wrap">
            <form action={formAction} className="v2-contact-form">
              <input type="hidden" name="interest" value="GENERAL" />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 300, marginBottom: "0.3rem" }}>
                Send a Message
              </h3>
              <div className="v2-form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input type="text" id="contact-name" name="name" placeholder="Your full name" required />
              </div>
              <div className="v2-form-group">
                <label htmlFor="contact-phone">Phone / WhatsApp</label>
                <input type="tel" id="contact-phone" name="phone" placeholder="+91 98000 00000" required />
              </div>
              <div className="v2-form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input type="email" id="contact-email" name="email" placeholder="you@example.com" />
              </div>
              <div className="v2-form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows={4} placeholder="Tell us what you're looking for..." />
              </div>
              {state && (
                <p className={`v2-form-status ${state.ok ? "v2-form-status--ok" : "v2-form-status--err"}`}>
                  {state.message}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="v2-btn v2-btn-gold rounded-none bg-transparent text-[inherit] w-full justify-center"
                style={{ opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
