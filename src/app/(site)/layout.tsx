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
  // The holding page is a single screen with nowhere to navigate to — every
  // other public route redirects back to it — so it drops the nav and footer.
  //
  // BookingProvider stays. The splash has no button that opens the modal, but
  // the hidden pages are still prerendered at build time, and /gallery,
  // /services and /podcast all render a BookButton, which throws without the
  // context. Dropping the provider here breaks the build, not the page.
  if (COMING_SOON) {
    return (
      <BookingProvider>
        <main>{children}</main>
      </BookingProvider>
    );
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
