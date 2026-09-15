import { COMING_SOON } from "@/lib/launch";
import { BackToTop } from "@/components/site/back-to-top";
import { BookingProvider } from "@/components/site/booking-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The holding page is a single screen: no nav, no footer, and no booking
  // modal, so none of that client JS ships. Every other public route
  // redirects back to it.
  if (COMING_SOON) {
    return <main>{children}</main>;
  }

  return (
    <BookingProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </BookingProvider>
  );
}
