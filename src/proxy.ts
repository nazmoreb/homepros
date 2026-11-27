import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const portal = pathname === "/portal" || pathname.startsWith("/portal/");
  if (!admin && !portal) return NextResponse.next();
  if (pathname === "/admin/login" || pathname === "/portal/login") return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const loginPath = admin ? "/admin/login" : "/portal/login";
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (admin && session.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
  if (portal && session.role !== "CONTRACTOR") return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
