import "server-only";
import { createHmac } from "node:crypto";

export function signWebhookBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export type WebhookResult = {
  status: "SENT" | "FAILED" | "SKIPPED";
  detail: string;
};

export async function postContractorWebhook(input: {
  url: string | null;
  secret: string | null;
  payload: unknown;
}): Promise<WebhookResult> {
  if (!input.url) return { status: "SKIPPED", detail: "No webhook URL." };
  let target: URL;
  try {
    target = new URL(input.url);
  } catch {
    return { status: "FAILED", detail: "Webhook URL is not valid." };
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return { status: "FAILED", detail: "Webhook URL must be http or https." };
  }

  const body = JSON.stringify(input.payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "HomePros-Lead-Delivery",
  };
  if (input.secret) headers["X-HomePros-Signature"] = `sha256=${signWebhookBody(body, input.secret)}`;

  try {
    const response = await fetch(target, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) {
      return { status: "FAILED", detail: `Webhook responded ${response.status}.` };
    }
    return { status: "SENT", detail: `Webhook responded ${response.status}.` };
  } catch (error) {
    return {
      status: "FAILED",
      detail: error instanceof Error ? error.message : "Webhook request failed.",
    };
  }
}
