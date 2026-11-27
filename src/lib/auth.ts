import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return user;
}

export async function requireContractor() {
  const session = await getSession();
  if (!session || session.role !== "CONTRACTOR") redirect("/portal/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { contractor: true },
  });
  if (!user || user.role !== "CONTRACTOR" || !user.contractor) redirect("/portal/login");
  return { user, contractor: user.contractor };
}
