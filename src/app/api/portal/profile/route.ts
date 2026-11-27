import type { NextRequest } from "next/server";
import { contractorDraftFromPayload, firstError } from "@/lib/contractor-form";
import { emailTaken, updateContractorAccount } from "@/lib/contractors";
import { readPayload, redirectTo, requireRequestUser } from "@/lib/request";
import { validateContractor } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const user = await requireRequestUser(request, "CONTRACTOR");
  if (!user?.contractor) return redirectTo(request, "/portal/login");
  const contractor = user.contractor;
  const payload = await readPayload(request);
  const draft = contractorDraftFromPayload(payload, contractor.status);
  draft.status = contractor.status;
  draft.monthlyLeadCap =
    contractor.monthlyLeadCap === null || contractor.monthlyLeadCap === undefined
      ? ""
      : String(contractor.monthlyLeadCap);

  const parsed = validateContractor(draft, { requirePassword: false });
  if (!parsed.ok) return redirectTo(request, "/portal/profile", { error: firstError(parsed.errors) });
  if (await emailTaken(parsed.data.email, contractor.id)) {
    return redirectTo(request, "/portal/profile", { error: "An account with that email already exists." });
  }

  await updateContractorAccount(contractor.id, parsed.data, {
    allowStatus: false,
    allowCap: false,
    existingSecret: contractor.webhookSecret,
  });
  return redirectTo(request, "/portal/profile", { saved: "1" });
}
