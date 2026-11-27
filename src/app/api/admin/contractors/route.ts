import type { NextRequest } from "next/server";
import { contractorDraftFromPayload, firstError } from "@/lib/contractor-form";
import { createContractorAccount, emailTaken } from "@/lib/contractors";
import { readPayload, redirectTo, requireRequestUser } from "@/lib/request";
import { validateContractor } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const admin = await requireRequestUser(request, "ADMIN");
  if (!admin) return redirectTo(request, "/admin/login");
  const payload = await readPayload(request);
  const parsed = validateContractor(contractorDraftFromPayload(payload, "PENDING"), {
    requirePassword: true,
  });
  if (!parsed.ok) return redirectTo(request, "/admin/contractors/new", { error: firstError(parsed.errors) });
  if (await emailTaken(parsed.data.email)) {
    return redirectTo(request, "/admin/contractors/new", { error: "An account with that email already exists." });
  }
  const contractor = await createContractorAccount(parsed.data, { status: parsed.data.status });
  return redirectTo(request, `/admin/contractors/${contractor.id}`);
}
