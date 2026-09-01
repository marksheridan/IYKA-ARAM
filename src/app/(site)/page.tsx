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
import { PodcastSection } from "@/components/site/podcast-section";
import { BookingSection } from "@/components/site/booking-section";
import { CtaSection } from "@/components/site/cta-section";
import { LocationSection } from "@/components/site/location-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Mission />
      {/* The five sub-brands follow the mission statement directly */}
      <PillarsSection />
      <Recognition />
      <ServicesSection />
      {/* Loud, self-moving imagery: events, clinic, treatments, patients */}
      <MovingGallery />
      <VideoTestimonials />
      <AboutSection />
      <TeamSection />
      {/* The Wellness Dialogues — vertical teasers into /podcast */}
      <PodcastSection />
      <StoreTeaser />
      <BookingSection />
      <CtaSection />
      {/* Contact lives at /contact now — no longer a homepage anchor. */}
      <LocationSection />
    </>
  );
}
