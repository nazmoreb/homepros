import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession, type SessionRole } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/session";

export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim().slice(0, 64);
  return (request.headers.get("x-real-ip") ?? "0.0.0.0").slice(0, 64);
}

export async function readPayload(request: NextRequest): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as unknown;
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
    return {};
  }
  const form = await request.formData();
  const data: Record<string, unknown> = {};
  const categories: string[] = [];
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    if (key === "categories") {
      categories.push(value);
      continue;
    }
    data[key] = value;
  }
  if (categories.length) data.categories = categories;
  return data;
}

export function wantsJson(request: Request): boolean {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function requireRequestUser(request: NextRequest, role: SessionRole) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== role) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { contractor: true },
  });
  if (!user || user.role !== role) return null;
  if (role === "CONTRACTOR" && !user.contractor) return null;
  return user;
}

export function stringsFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

export function redirectTo(_request: Request, path: string, params?: Record<string, string>) {
  const url = new URL(path, "http://homepros.local");
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  // Relative Location keeps the browser on the host it used (127.0.0.1 vs localhost).
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `${url.pathname}${url.search}` },
  });
}
