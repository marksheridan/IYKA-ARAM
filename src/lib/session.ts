import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
);
const COOKIE = "iyka_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "ADMIN" | "FRONT_DESK" | "DOCTOR";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  staffId: string | null;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
      staffId: (payload.staffId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const c = await cookies();
  c.delete(COOKIE);
}
