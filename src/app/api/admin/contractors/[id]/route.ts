import { contractorStatuses, type ContractorStatus } from "@/lib/categories";
import { contractorDraftFromPayload, firstError } from "@/lib/contractor-form";
import { emailTaken, updateContractorAccount } from "@/lib/contractors";
import { prisma } from "@/lib/db";
import { readPayload, redirectTo, requireRequestUser } from "@/lib/request";
import { validateContractor } from "@/lib/validation";
import type { NextRequest } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const admin = await requireRequestUser(request, "ADMIN");
  if (!admin) return redirectTo(request, "/admin/login");
  const { id } = await context.params;
  const existing = await prisma.contractor.findUnique({ where: { id } });
  if (!existing) return redirectTo(request, "/admin/contractors", { error: "Contractor not found." });

  const payload = await readPayload(request);
  if (payload.intent === "status") {
    const status = String(payload.status ?? "").toUpperCase();
    if (!contractorStatuses.includes(status as ContractorStatus)) {
      return redirectTo(request, "/admin/contractors", { error: "Choose a valid status." });
    }
    await prisma.contractor.update({ where: { id }, data: { status } });
    return redirectTo(request, "/admin/contractors");
  }

  const parsed = validateContractor(contractorDraftFromPayload(payload, existing.status), {
    requirePassword: false,
  });
  if (!parsed.ok) return redirectTo(request, `/admin/contractors/${id}`, { error: firstError(parsed.errors) });
  if (await emailTaken(parsed.data.email, id)) {
    return redirectTo(request, `/admin/contractors/${id}`, { error: "An account with that email already exists." });
  }

  await updateContractorAccount(id, parsed.data, {
    allowStatus: true,
    allowCap: true,
    existingSecret: existing.webhookSecret,
  });
  return redirectTo(request, `/admin/contractors/${id}`, { saved: "1" });
}
