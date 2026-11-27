import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCategoryById } from "@/lib/categories";
import { buildConsentText, buildNoMatchConsentText } from "@/lib/consent";
import {
  categoryLabel,
  formatPhone,
  formatProjectDetails,
  homeownerLabel,
  personName,
  timelineLabel,
} from "@/lib/format";
import { matchContractors, monthStartUtc, type MatchCandidate } from "@/lib/matching";
import type { Attribution } from "@/lib/attribution";
import { getEmailProvider } from "@/lib/email";
import { postContractorWebhook } from "@/lib/webhook";
import type { LeadSubmission } from "@/lib/validation";

export type PublicContractor = {
  id: string;
  businessName: string;
  city: string | null;
  state: string | null;
  phone?: string;
};

export class ConsentMismatchError extends Error {
  contractors: PublicContractor[];
  consentText: string;

  constructor(contractors: PublicContractor[], consentText: string) {
    super("Consent text does not match the current matches.");
    this.name = "ConsentMismatchError";
    this.contractors = contractors;
    this.consentText = consentText;
  }
}

type Db = Prisma.TransactionClient | typeof prisma;

function publicContractor(
  candidate: MatchCandidate,
  directory: Map<string, { city: string | null; state: string | null; phone: string }>,
  includePhone: boolean,
): PublicContractor {
  const extra = directory.get(candidate.id);
  return {
    id: candidate.id,
    businessName: candidate.businessName,
    city: extra?.city ?? null,
    state: extra?.state ?? null,
    ...(includePhone && extra ? { phone: extra.phone } : {}),
  };
}

export async function loadMatchCandidates(db: Db = prisma, now = new Date()) {
  const contractors = await db.contractor.findMany({
    where: { status: "APPROVED" },
    orderBy: { businessName: "asc" },
  });
  const start = monthStartUtc(now);
  const counts = contractors.length
    ? await db.leadAssignment.groupBy({
        by: ["contractorId"],
        where: {
          status: "SENT",
          createdAt: { gte: start },
          contractorId: { in: contractors.map((contractor) => contractor.id) },
        },
        _count: { _all: true },
      })
    : [];
  const countById = new Map(counts.map((row) => [row.contractorId, row._count._all]));
  const directory = new Map(
    contractors.map((contractor) => [
      contractor.id,
      { city: contractor.city, state: contractor.state, phone: contractor.phone },
    ]),
  );
  const candidates: MatchCandidate[] = contractors.map((contractor) => ({
    id: contractor.id,
    businessName: contractor.businessName,
    status: contractor.status,
    categories: contractor.categories,
    serviceZips: contractor.serviceZips,
    monthlyLeadCap: contractor.monthlyLeadCap,
    leadsThisMonth: countById.get(contractor.id) ?? 0,
  }));
  return { candidates, directory };
}

export async function previewMatches(zip: string, categoryId: string) {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  const { candidates, directory } = await loadMatchCandidates();
  const matches = matchContractors({ zip, category: category.id }, candidates);
  const contractors = matches.map((match) => publicContractor(match, directory, false));
  const consentText =
    contractors.length > 0
      ? buildConsentText(
          contractors.map((contractor) => contractor.businessName),
          category.label,
        )
      : buildNoMatchConsentText(zip, category.label);
  return { contractors, consentText, category };
}

function leadEmail(input: {
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zip: string;
    category: string;
    timeline: string;
    homeownerStatus: string;
    projectDetails: unknown;
  };
  businessName: string;
}) {
  const details = formatProjectDetails(input.lead.category, input.lead.projectDetails)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
  const text = [
    `New HomePros lead for ${input.businessName}.`,
    ``,
    `${personName(input.lead.firstName, input.lead.lastName)} asked to be contacted about a ${categoryLabel(input.lead.category).toLowerCase()} project in ${input.lead.zip}.`,
    `Phone: ${formatPhone(input.lead.phone)}`,
    `Email: ${input.lead.email}`,
    `Timeline: ${timelineLabel(input.lead.timeline)}`,
    `Homeowner status: ${homeownerLabel(input.lead.homeownerStatus)}`,
    ``,
    details,
    ``,
    `They gave one-to-one consent for ${input.businessName} to contact them about this project. HomePros shared this introduction with at most three contractors.`,
  ].join("\n");

  const html = `<p>New HomePros lead for <strong>${escapeHtml(input.businessName)}</strong>.</p>
<p>${escapeHtml(personName(input.lead.firstName, input.lead.lastName))} asked to be contacted about a ${escapeHtml(categoryLabel(input.lead.category).toLowerCase())} project in ${escapeHtml(input.lead.zip)}.</p>
<ul>
<li>Phone: ${escapeHtml(formatPhone(input.lead.phone))}</li>
<li>Email: ${escapeHtml(input.lead.email)}</li>
<li>Timeline: ${escapeHtml(timelineLabel(input.lead.timeline))}</li>
<li>Homeowner status: ${escapeHtml(homeownerLabel(input.lead.homeownerStatus))}</li>
</ul>
<pre>${escapeHtml(details)}</pre>
<p>They gave one-to-one consent for ${escapeHtml(input.businessName)} to contact them about this project.</p>`;

  return {
    subject: `New HomePros lead in ${input.lead.zip}: ${categoryLabel(input.lead.category)}`,
    text,
    html,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function createLead(input: {
  submission: LeadSubmission;
  attribution: Attribution;
  ip: string;
  userAgent: string;
}) {
  const category = getCategoryById(input.submission.category);
  if (!category) throw new Error("Unknown category.");

  const created = await prisma.$transaction(async (tx) => {
    const { candidates, directory } = await loadMatchCandidates(tx);
    const matches = matchContractors(
      { zip: input.submission.zip, category: category.id },
      candidates,
    );
    const contractors = matches.map((match) => publicContractor(match, directory, true));
    const consentText =
      contractors.length > 0
        ? buildConsentText(
            contractors.map((contractor) => contractor.businessName),
            category.label,
          )
        : buildNoMatchConsentText(input.submission.zip, category.label);

    if (consentText !== input.submission.consentText) {
      throw new ConsentMismatchError(
        contractors.map((contractor) => ({
          id: contractor.id,
          businessName: contractor.businessName,
          city: contractor.city,
          state: contractor.state,
        })),
        consentText,
      );
    }

    const lead = await tx.lead.create({
      data: {
        zip: input.submission.zip,
        category: category.id,
        projectDetails: input.submission.projectDetails,
        timeline: input.submission.timeline,
        homeownerStatus: input.submission.homeownerStatus,
        firstName: input.submission.firstName,
        lastName: input.submission.lastName,
        email: input.submission.email,
        phone: input.submission.phone,
        utmSource: input.attribution.utmSource,
        utmMedium: input.attribution.utmMedium,
        utmCampaign: input.attribution.utmCampaign,
        utmTerm: input.attribution.utmTerm,
        utmContent: input.attribution.utmContent,
        gclid: input.attribution.gclid,
        fbclid: input.attribution.fbclid,
        consentText,
        consentAt: new Date(),
        consentIp: input.ip.slice(0, 64),
        consentUserAgent: input.userAgent.slice(0, 500),
        consentPageUrl: input.submission.pageUrl,
        status: contractors.length > 0 ? "ASSIGNED" : "UNMATCHED",
        assignments: {
          create: matches.map((match) => ({ contractorId: match.id, status: "SENT" })),
        },
      },
      include: { assignments: true },
    });

    return { lead, contractors };
  });

  const fullContractors = await prisma.contractor.findMany({
    where: { id: { in: created.contractors.map((contractor) => contractor.id) } },
  });
  const byId = new Map(fullContractors.map((contractor) => [contractor.id, contractor]));
  const email = getEmailProvider();

  for (const matched of created.contractors) {
    const contractor = byId.get(matched.id);
    if (!contractor) continue;
    const message = leadEmail({
      lead: created.lead,
      businessName: contractor.businessName,
    });
    const emailResult = await email.send({ to: contractor.email, ...message });
    await prisma.delivery.create({
      data: {
        leadId: created.lead.id,
        contractorId: contractor.id,
        channel: "EMAIL",
        provider: emailResult.provider,
        status: emailResult.status,
        target: contractor.email,
        detail: emailResult.detail,
      },
    });

    if (contractor.webhookUrl) {
      const webhook = await postContractorWebhook({
        url: contractor.webhookUrl,
        secret: contractor.webhookSecret,
        payload: {
          event: "lead.assigned",
          leadId: created.lead.id,
          assignedAt: created.lead.createdAt.toISOString(),
          category: created.lead.category,
          zip: created.lead.zip,
          timeline: created.lead.timeline,
          homeownerStatus: created.lead.homeownerStatus,
          projectDetails: created.lead.projectDetails,
          homeowner: {
            firstName: created.lead.firstName,
            lastName: created.lead.lastName,
            email: created.lead.email,
            phone: created.lead.phone,
          },
        },
      });
      await prisma.delivery.create({
        data: {
          leadId: created.lead.id,
          contractorId: contractor.id,
          channel: "WEBHOOK",
          provider: "webhook",
          status: webhook.status,
          target: contractor.webhookUrl,
          detail: webhook.detail,
        },
      });
    }
  }

  return {
    token: created.lead.publicToken,
    status: created.lead.status,
    contractors: created.contractors,
  };
}
