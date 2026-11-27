export const attributionParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

export type AttributionParam = (typeof attributionParams)[number];

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
};

export const emptyAttribution = (): Attribution => ({
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  fbclid: null,
});

const fieldByParam: Record<AttributionParam, keyof Attribution> = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_term: "utmTerm",
  utm_content: "utmContent",
  gclid: "gclid",
  fbclid: "fbclid",
};

function clean(value: string): string | null {
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

export function attributionFromSearch(params: URLSearchParams): Partial<Attribution> {
  const next: Partial<Attribution> = {};
  for (const key of attributionParams) {
    const value = params.get(key);
    if (!value) continue;
    const cleaned = clean(value);
    if (cleaned) next[fieldByParam[key]] = cleaned;
  }
  return next;
}

export function parseAttributionCookie(raw: string | undefined | null): Attribution {
  const result = emptyAttribution();
  if (!raw) return result;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    for (const key of attributionParams) {
      const value = parsed[key];
      if (typeof value !== "string") continue;
      const cleaned = clean(value);
      if (cleaned) result[fieldByParam[key]] = cleaned;
    }
  } catch {
    return emptyAttribution();
  }
  return result;
}

export function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function attributionFromBody(input: unknown): Attribution {
  const result = emptyAttribution();
  if (!input || typeof input !== "object") return result;
  const record = input as Record<string, unknown>;
  for (const key of attributionParams) {
    const direct = record[key];
    const camel = record[fieldByParam[key]];
    const value = typeof direct === "string" ? direct : typeof camel === "string" ? camel : null;
    if (!value) continue;
    const cleaned = clean(value);
    if (cleaned) result[fieldByParam[key]] = cleaned;
  }
  return result;
}

export function mergeAttribution(base: Attribution, extra: Attribution): Attribution {
  const merged = { ...base };
  for (const key of Object.keys(merged) as (keyof Attribution)[]) {
    if (extra[key]) merged[key] = extra[key];
  }
  return merged;
}
