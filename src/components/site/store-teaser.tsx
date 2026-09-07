import { Reveal } from "./reveal";

/* ────────────────────────────────────────────────────────────────
   Store "Coming Soon" banner.

   The store itself is de-wired until launch (no nav/footer links).
   When the client sends the banner artwork: drop the file into
   /public and set STORE_BANNER_IMAGE to its path — the placeholder
   panel is replaced automatically. To go live, re-add the store
   links in site-header.tsx / site-footer.tsx and swap this section
   back for the product grid.
   ──────────────────────────────────────────────────────────── */
const STORE_BANNER_IMAGE = "/store-banner.jpg";

export function StoreTeaser() {
  return (
    <section
      id="store"
      className="v2-landing scroll-mt-20"
      style={{ background: "var(--cream-deep)", paddingBlock: "var(--section-py)" }}
    >
      <div className="v2-container">
        <Reveal className="st-banner">
          <div className="st-copy">
            <p className="st-badge">Online Store &middot; Coming Soon</p>
            <h2 className="v2-section-title-compact st-title">
              Shop IYKA Living —
              <br />
              <em>wellness you can hold.</em>
            </h2>
            <p className="st-text">
              Herbal oils, skin and hair care, yoga essentials and gift boxes
              — formulated by Dr. Emidaka and the clinical team. You&rsquo;ll be
              able to browse and order everything right here when our online
              store opens.
            </p>
          </div>

          <div className="st-visual">
            {STORE_BANNER_IMAGE ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={STORE_BANNER_IMAGE} alt="IYKA Living online store — opening soon" className="st-image" />
            ) : (
              <div className="st-placeholder" role="img" aria-label="Store banner artwork coming soon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span>Store artwork coming soon</span>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
