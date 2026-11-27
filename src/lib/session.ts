export const SESSION_COOKIE = "hp_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionRole = "ADMIN" | "CONTRACTOR";

export type SessionPayload = {
  userId: string;
  role: SessionRole;
  exp: number;
};

function authSecret(): string | null {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return null;
  return value;
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return bytesToBase64Url(signature);
}

export async function signSession(input: { userId: string; role: SessionRole }): Promise<string> {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET must be set to at least 16 characters.");
  const payload: SessionPayload = {
    userId: input.userId,
    role: input.role,
    exp: Date.now() + SESSION_MS,
  };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmac(body, secret);
  return `${body}.${signature}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = authSecret();
  if (!secret) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await hmac(body, secret);
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as SessionPayload;
    if (!payload.userId || (payload.role !== "ADMIN" && payload.role !== "CONTRACTOR")) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(secure = false) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_MS / 1000,
  };
}

export function requestIsSecure(request: { headers: Headers; nextUrl?: { protocol: string } }): boolean {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  return request.nextUrl?.protocol === "https:";
}

export function safeNextPath(value: string | null | undefined, role: SessionRole): string {
  const fallback = role === "ADMIN" ? "/admin" : "/portal";
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (role === "ADMIN" && (value === "/admin" || value.startsWith("/admin/"))) return value;
  if (role === "CONTRACTOR" && (value === "/portal" || value.startsWith("/portal/"))) return value;
  return fallback;
}
