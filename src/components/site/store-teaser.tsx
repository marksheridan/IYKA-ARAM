import { Reveal } from "./reveal";

/* ────────────────────────────────────────────────────────────────
   Store "Coming Soon" banner.

   The store itself is de-wired until launch (no nav/footer links).
   The visual is a mosaic collage of the IYKA Living product shoot —
   edit STORE_COLLAGE to swap a tile (files live in
   /public/store-collage). To go live, re-add the store links in
   site-header.tsx / site-footer.tsx and swap this section back for
   the product grid.
   ──────────────────────────────────────────────────────────── */
const STORE_COLLAGE = [
  { slot: "a", src: "/store-collage/gift-box.webp", alt: "IYKA-ARAM elixir gift box with dropper bottles on a woven rattan tray" },
  { slot: "b", src: "/store-collage/yoga-mat.webp", alt: "Cork yoga mat printed with the IYKA-ARAM logo, unrolled beside rolled mats" },
  { slot: "c", src: "/store-collage/elixir.webp", alt: "IYKA-ARAM Elixir roll-on oil resting on river stones" },
  { slot: "d", src: "/store-collage/jars.webp", alt: "Elixir skincare jars beside an IYKA-ARAM gift bag" },
  { slot: "e", src: "/store-collage/soaps.webp", alt: "Handmade IYKA-ARAM soap bars with kraft packaging" },
  { slot: "f", src: "/store-collage/hamper.webp", alt: "IYKA-ARAM gift hamper of wrapped soaps in a woven basket" },
] as const;

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
            <div className="st-collage">
              {STORE_COLLAGE.map((tile, i) => (
                <figure key={tile.slot} className={`st-tile st-tile-${tile.slot}`} style={{ "--i": i } as React.CSSProperties}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tile.src} alt={tile.alt} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
