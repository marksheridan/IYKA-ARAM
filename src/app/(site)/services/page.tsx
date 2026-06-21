export const metadata = { title: "Services" };

const services = [
  "Functional Medicine Consultation (offline / online)",
  "Offline Naturopathy & Therapy Sessions",
  "Online Yoga Classes",
];

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 md:px-12">
      <h1 className="font-display text-3xl text-forest">Services</h1>
      <ul className="mt-6 space-y-3 text-muted">
        {services.map((s) => (
          <li key={s} className="border-l-2 border-gold pl-4">
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-muted">
        Bookable flows are built in Phase 2.
      </p>
    </section>
  );
}
