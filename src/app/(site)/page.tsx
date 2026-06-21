import { Hero } from "@/components/site/hero";
import { Recognition } from "@/components/site/recognition";
import { Mission } from "@/components/site/mission";
import { ServicesSection } from "@/components/site/services-section";
import { TeamSection } from "@/components/site/team-section";
import { Testimonials } from "@/components/site/testimonials";
import { ProductsTeaser } from "@/components/site/products-teaser";
import { LocationSection } from "@/components/site/location-section";
import { CtaSection } from "@/components/site/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Recognition />
      <Mission />
      <ServicesSection />
      <TeamSection />
      <Testimonials />
      <ProductsTeaser />
      <LocationSection />
      <CtaSection />
    </>
  );
}
