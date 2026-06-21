import { Hero } from "@/components/site/hero";
import { Mission } from "@/components/site/mission";
import { Recognition } from "@/components/site/recognition";
import { ServicesSection } from "@/components/site/services-section";
import { AboutSection } from "@/components/site/about-section";
import { TeamSection } from "@/components/site/team-section";
import { ProductsTeaser } from "@/components/site/products-teaser";
import { EventsSection } from "@/components/site/events-section";
import { Testimonials } from "@/components/site/testimonials";
import { BookingSection } from "@/components/site/booking-section";
import { CtaSection } from "@/components/site/cta-section";
import { LocationSection } from "@/components/site/location-section";
import { ContactSection } from "@/components/site/contact-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Mission />
      <Recognition />
      <ServicesSection />
      <AboutSection />
      <TeamSection />
      <ProductsTeaser />
      <EventsSection />
      <Testimonials />
      <BookingSection />
      <CtaSection />
      <LocationSection />
      <ContactSection />
    </>
  );
}
