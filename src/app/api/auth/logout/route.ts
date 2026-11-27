import type { NextRequest } from "next/server";
import { redirectTo } from "@/lib/request";
import { SESSION_COOKIE, requestIsSecure, sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = redirectTo(request, "/");
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(requestIsSecure(request)), maxAge: 0 });
  return response;
}
