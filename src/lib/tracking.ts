export type HomeProsEvent =
  | "quote_started"
  | "quote_step_completed"
  | "matches_shown"
  | "lead_submitted"
  | "contractor_signup";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Conversion hook. Always pushes to dataLayer and dispatches `homepros:event`.
 * If gtag or fbq was loaded (via the measurement env vars, or a later tag), those fire too.
 */
export function track(event: HomeProsEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = { event, ...(params ?? {}) };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.gtag?.("event", event, params ?? {});
  window.fbq?.("trackCustom", event, params ?? {});
  window.dispatchEvent(new CustomEvent("homepros:event", { detail: payload }));
}

export function trackLeadSubmitted(params: {
  category: string;
  zip: string;
  matched: number;
}) {
  track("lead_submitted", params);
  if (typeof window === "undefined") return;
  window.gtag?.("event", "generate_lead", params);
  window.fbq?.("track", "Lead", params);
}

export function safePublicId(value: string | undefined, pattern: RegExp): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return pattern.test(trimmed) ? trimmed : null;
}
