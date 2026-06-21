import Image from "next/image";
import { Reveal } from "./reveal";

const products = [
  { name: "Keshanidhi Hair Oil", category: "Hair Care", price: "₹480", img: "/products/keshanidhi-hair-oil.jpg" },
  { name: "Organic Soap – Garo Hills", category: "Skin Care", price: "₹160", img: "/products/organic-soap.jpg" },
  { name: "Organic Cork Yoga Mat", category: "Yoga", price: "₹1,200", img: "/products/yoga-mat.jpg" },
  { name: "Aloe Vera Gel", category: "Skin Care", price: "₹520", img: "/products/aloe-vera-gel.jpg" },
  { name: "Luxury Wellness Gift Box", category: "Gift Sets", price: "₹1,800", img: "/products/gift-box.jpg" },
  { name: "Stress Relief Oil", category: "Wellness", price: "₹380", img: "/products/stress-oil.jpg" },
];

export function ProductsTeaser() {
  return (
    <section
      id="products"
      className="v2-landing v2-section-py scroll-mt-20"
      style={{ background: "var(--cream)" }}
    >
      <div className="v2-container">
        <div className="v2-products-head">
          <Reveal>
            <p className="v2-section-label" style={{ marginBottom: "1rem" }}>
              IYKA Living
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 300 }}>
              Wellness you can
              <br />
              <em style={{ color: "var(--gold)" }}>hold in your hands.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="/store" className="v2-btn v2-btn-outline-dark">
              Visit Store
            </a>
          </Reveal>
        </div>

        <div className="v2-products-grid">
          {products.map((p, i) => (
            <Reveal key={p.name} className="v2-product-card" delay={(i % 4) * 0.08}>
              <div className="v2-product-image-wrap">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  sizes="(max-width: 900px) 50vw, 30vw"
                  className="v2-product-image"
                />
                <div className="v2-product-overlay">
                  <a
                    href="/store"
                    className="v2-btn v2-btn-gold rounded-none"
                    style={{ fontSize: "0.75rem", padding: "0.6rem 1.2rem" }}
                  >
                    View Product
                  </a>
                </div>
              </div>
              <div className="v2-product-info">
                <span className="v2-product-category">{p.category}</span>
                <h3 className="v2-product-name">{p.name}</h3>
                <span className="v2-product-price">{p.price}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
