import type { NextRequest } from "next/server";
import { contractorDraftFromPayload, firstError } from "@/lib/contractor-form";
import { createContractorAccount, emailTaken } from "@/lib/contractors";
import { jsonError, readPayload, redirectTo, wantsJson } from "@/lib/request";
import { validateContractor } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const parsed = validateContractor(contractorDraftFromPayload(payload, "PENDING"), {
    requirePassword: true,
  });
  if (!parsed.ok) {
    const message = firstError(parsed.errors);
    if (wantsJson(request)) return jsonError(message, 400, { fields: parsed.errors });
    return redirectTo(request, "/contractors", { error: message });
  }
  if (await emailTaken(parsed.data.email)) {
    const message = "An account with that email already exists.";
    if (wantsJson(request)) return jsonError(message, 409);
    return redirectTo(request, "/contractors", { error: message });
  }

  await createContractorAccount(parsed.data, { status: "PENDING" });
  if (wantsJson(request)) return Response.json({ ok: true });
  return redirectTo(request, "/contractors", { submitted: "1" });
}
