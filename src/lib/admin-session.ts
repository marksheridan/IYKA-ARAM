import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? process.env.AUTH_SECRET ?? "dev-only-admin-secret",
);
const COOKIE = "iyka_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function createAdminSession() {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function getAdminSession(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");
}

export async function destroyAdminSession() {
  const c = await cookies();
  c.delete(COOKIE);
}
