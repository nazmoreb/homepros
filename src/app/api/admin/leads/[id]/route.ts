import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { readPayload, redirectTo, requireRequestUser } from "@/lib/request";

const statuses = new Set(["RETURNED", "INVALID"]);

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const admin = await requireRequestUser(request, "ADMIN");
  if (!admin) return redirectTo(request, "/admin/login");
  const { id } = await context.params;
  const payload = await readPayload(request);
  const status = String(payload.status ?? "");
  if (!statuses.has(status)) return redirectTo(request, `/admin/leads/${id}`, { error: "Choose returned or invalid." });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return redirectTo(request, "/admin/leads", { error: "Lead not found." });

  const note = String(payload.note ?? "").trim().slice(0, 500);
  const stamp = `${new Date().toISOString()} marked ${status}${note ? `: ${note}` : ""}`;
  const notes = [lead.notes, stamp].filter(Boolean).join("\n");

  await prisma.$transaction([
    prisma.lead.update({ where: { id }, data: { status, notes } }),
    prisma.leadAssignment.updateMany({ where: { leadId: id }, data: { status } }),
  ]);

  return redirectTo(request, `/admin/leads/${id}`, { saved: "1" });
}
