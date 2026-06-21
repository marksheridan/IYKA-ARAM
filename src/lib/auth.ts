import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession, type Role, type SessionUser } from "@/lib/session";

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !user.email) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email,
    role: user.role,
    staffId: user.staffId ?? null,
  };
}

export async function getCurrentUser() {
  return getSession();
}

/** Guard for MIS server components/actions. Redirects if unauthenticated or
 *  lacking one of the allowed roles. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/mis?error=forbidden");
  return user;
}
