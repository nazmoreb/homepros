import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, readPayload, redirectTo, wantsJson } from "@/lib/request";
import {
  SESSION_COOKIE,
  requestIsSecure,
  safeNextPath,
  sessionCookieOptions,
  signSession,
  type SessionRole,
} from "@/lib/session";

const dummyHash = bcrypt.hashSync("homepros-timing-pad", 8);

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");
  const role: SessionRole = payload.role === "CONTRACTOR" ? "CONTRACTOR" : "ADMIN";
  const loginPath = role === "ADMIN" ? "/admin/login" : "/portal/login";

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const hash = user?.passwordHash ?? dummyHash;
  const passwordOk = await bcrypt.compare(password, hash).catch(() => false);

  if (!user || !passwordOk || user.role !== role) {
    const message =
      user && passwordOk && user.role !== role
        ? "This account does not have access to that page."
        : "Email or password is not right.";
    if (wantsJson(request)) return jsonError(message, 401);
    return redirectTo(request, loginPath, { error: message, next: String(payload.next ?? "") });
  }

  try {
    const token = await signSession({ userId: user.id, role: user.role as SessionRole });
    const destination = safeNextPath(typeof payload.next === "string" ? payload.next : null, role);
    const cookie = sessionCookieOptions(requestIsSecure(request));
    if (wantsJson(request)) {
      const response = NextResponse.json({ ok: true, redirect: destination });
      response.cookies.set(SESSION_COOKIE, token, cookie);
      return response;
    }
    const response = redirectTo(request, destination);
    response.cookies.set(SESSION_COOKIE, token, cookie);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in is not configured.";
    if (wantsJson(request)) return jsonError(message, 500);
    return redirectTo(request, loginPath, { error: message });
  }
}
