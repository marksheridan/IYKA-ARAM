import { Hero } from "@/components/site/hero";
import { Mission } from "@/components/site/mission";
import { Recognition } from "@/components/site/recognition";
import { ServicesSection } from "@/components/site/services-section";
import { MovingGallery } from "@/components/site/moving-gallery";
import { VideoTestimonials } from "@/components/site/video-testimonials";
import { PillarsSection } from "@/components/site/pillars-section";
import { AboutSection } from "@/components/site/about-section";
import { TeamSection } from "@/components/site/team-section";
import { StoreTeaser } from "@/components/site/store-teaser";
import { BookingSection } from "@/components/site/booking-section";
import { CtaSection } from "@/components/site/cta-section";
import { LocationSection } from "@/components/site/location-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Mission />
      <Recognition />
      <ServicesSection />
      {/* Loud, self-moving imagery: events, clinic, treatments, patients */}
      <MovingGallery />
      <VideoTestimonials />
      {/* Second half opens with the five sub-brands */}
      <PillarsSection />
      <AboutSection />
      <TeamSection />
      <StoreTeaser />
      <BookingSection />
      <CtaSection />
      {/* Contact lives at /contact now — no longer a homepage anchor. */}
      <LocationSection />
    </>
  );
}
