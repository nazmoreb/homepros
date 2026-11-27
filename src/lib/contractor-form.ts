import "server-only";
import { stringsFrom } from "@/lib/request";
import type { ContractorDraft, FieldErrors } from "@/lib/validation";

export function contractorDraftFromPayload(
  payload: Record<string, unknown>,
  statusFallback: string,
): ContractorDraft {
  return {
    businessName: String(payload.businessName ?? ""),
    contactName: String(payload.contactName ?? ""),
    email: String(payload.email ?? ""),
    phone: String(payload.phone ?? ""),
    categories: stringsFrom(payload.categories),
    serviceZips:
      typeof payload.serviceZips === "string" ? [payload.serviceZips] : stringsFrom(payload.serviceZips),
    city: String(payload.city ?? ""),
    state: String(payload.state ?? ""),
    bio: String(payload.bio ?? ""),
    licenseNumber: String(payload.licenseNumber ?? ""),
    yearsInBusiness: String(payload.yearsInBusiness ?? ""),
    monthlyLeadCap: String(payload.monthlyLeadCap ?? ""),
    webhookUrl: String(payload.webhookUrl ?? ""),
    webhookSecret: String(payload.webhookSecret ?? ""),
    status: String(payload.status || statusFallback),
    password: String(payload.password ?? ""),
  };
}

export function firstError(errors: FieldErrors): string {
  return Object.values(errors)[0] ?? "Check the form and try again.";
}
