import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Lightweight DB health check. Confirms the app can reach Postgres.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.lead.count();
    return NextResponse.json({ ok: true, db: "connected", leads });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
