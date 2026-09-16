import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Defence in depth: the proxy gate already matches this path, but a matcher
  // change shouldn't silently re-open the one route that writes. See src/proxy.ts.
  if (process.env.STORE_LIVE !== "true") {
    return NextResponse.json(
      { error: "The store is not open yet." },
      { status: 404 },
    );
  }

  try {
    const body = await req.json();
    const { name, phone, email, street, city, state, pin, payment, items, subtotal, delivery, codCharge, total } = body;

    if (!name || !phone || !street || !city || !state || !pin || !items?.length) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const orderNumber = "IYKA" + Date.now().toString().slice(-8);

    const order = await prisma.storeOrder.create({
      data: {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        street,
        city,
        state,
        pin,
        paymentMethod: payment,
        subtotal,
        deliveryCharge: delivery,
        codCharge: codCharge ?? 0,
        total,
        status: "PLACED",
        items: {
          create: items.map((item: { slug: string; name: string; price: number; qty: number }) => ({
            productSlug: item.slug,
            productName: item.name,
            price: item.price,
            quantity: item.qty,
            total: item.price * item.qty,
          })),
        },
      },
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
