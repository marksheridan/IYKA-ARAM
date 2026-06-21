import { BookingProvider } from "@/components/site/booking-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </BookingProvider>
  );
}
