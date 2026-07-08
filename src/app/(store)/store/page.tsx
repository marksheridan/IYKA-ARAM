import { prisma } from "@/lib/db";
import { StoreGrid } from "./store-grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "IYKA Living Store" };

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))];

  return (
    <>
      {/* Hero */}
      <section style={{ background: "var(--dark)", color: "var(--cream)", padding: "5rem 2rem 4rem" }}>
        <div className="store-container">
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem" }}>
            Iyka-Aram · IYKA Living
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: "1rem" }}>
            Wellness you can<br /><em style={{ color: "var(--gold)" }}>hold in your hands.</em>
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(248,244,238,0.65)", maxWidth: "36rem", lineHeight: 1.7 }}>
            Every product formulated by Dr. Emidaka and her clinical team — pure ingredients, therapeutic intent, zero compromise.
          </p>
        </div>
      </section>

      <StoreGrid products={products} categories={categories} />

      {/* Trust bar */}
      <section style={{ background: "var(--cream-mid)", padding: "2.5rem 2rem", borderTop: "1px solid var(--cream-deep)" }}>
        <div className="store-container">
          <div className="store-trust-bar">
            {[
              { icon: "🌿", text: "All Natural Ingredients" },
              { icon: "🧪", text: "Clinically Formulated" },
              { icon: "📦", text: "Pan-India Delivery" },
              { icon: "↩️", text: "7-Day Easy Returns" },
            ].map((t) => (
              <div key={t.text} className="store-trust-item">
                <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.05em" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
