import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";
import { categoryLabel, formatPhone } from "@/lib/format";
import { leadWhere } from "@/lib/lead-filters";
import { redirectTo, requireRequestUser } from "@/lib/request";

const include = {
  assignments: { include: { contractor: true } },
} satisfies Prisma.LeadInclude;

export async function GET(request: NextRequest) {
  const admin = await requireRequestUser(request, "ADMIN");
  if (!admin) return redirectTo(request, "/admin/login");
  const params = request.nextUrl.searchParams;
  const leads = await prisma.lead.findMany({
    where: leadWhere({
      status: params.get("status") ?? "",
      category: params.get("category") ?? "",
      zip: params.get("zip") ?? "",
      q: params.get("q") ?? "",
    }),
    include,
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = [
    "id",
    "createdAt",
    "status",
    "zip",
    "category",
    "timeline",
    "homeownerStatus",
    "firstName",
    "lastName",
    "email",
    "phone",
    "projectDetails",
    "contractors",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmTerm",
    "utmContent",
    "gclid",
    "fbclid",
    "consentAt",
    "consentIp",
    "consentPageUrl",
  ];
  const rows = leads.map((lead) => [
    lead.id,
    lead.createdAt.toISOString(),
    lead.status,
    lead.zip,
    categoryLabel(lead.category),
    lead.timeline,
    lead.homeownerStatus,
    lead.firstName,
    lead.lastName,
    lead.email,
    formatPhone(lead.phone),
    JSON.stringify(lead.projectDetails),
    lead.assignments.map((assignment) => assignment.contractor.businessName).join("; "),
    lead.utmSource ?? "",
    lead.utmMedium ?? "",
    lead.utmCampaign ?? "",
    lead.utmTerm ?? "",
    lead.utmContent ?? "",
    lead.gclid ?? "",
    lead.fbclid ?? "",
    lead.consentAt.toISOString(),
    lead.consentIp,
    lead.consentPageUrl,
  ]);
  const csv = toCsv([header, ...rows]);
  const filename = `homepros-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
