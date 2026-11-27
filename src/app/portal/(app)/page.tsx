import { Suspense } from "react";
import { requireContractor } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  categoryLabel,
  formatPhone,
  formatProjectDetails,
  formatWhen,
  homeownerLabel,
  leadStatusLabel,
  personName,
  timelineLabel,
} from "@/lib/format";
import { StatusPill } from "@/components/ui";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading your leads…</p>}>
      <PortalLeads />
    </Suspense>
  );
}

async function PortalLeads() {
  const { contractor } = await requireContractor();
  const assignments = await prisma.leadAssignment.findMany({
    where: { contractorId: contractor.id },
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Your leads</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {contractor.businessName} sees only the homeowners matched to you.
      </p>
      {assignments.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-line bg-card px-5 py-8 text-sm text-ink-soft">
          No leads yet. When HomePros matches you to a request, it will show up here and in your email.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {assignments.map((assignment) => {
            const lead = assignment.lead;
            const details = formatProjectDetails(lead.category, lead.projectDetails);
            return (
              <li key={assignment.id} className="rounded-3xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl">{personName(lead.firstName, lead.lastName)}</h2>
                  <StatusPill status={assignment.status} label={leadStatusLabel(assignment.status)} />
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {categoryLabel(lead.category)} · {lead.zip} · {formatWhen(assignment.createdAt)}
                </p>
                <div className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
                  <p>Phone {formatPhone(lead.phone)}</p>
                  <p>Email {lead.email}</p>
                  <p>Timeline {timelineLabel(lead.timeline)}</p>
                  <p>Home {homeownerLabel(lead.homeownerStatus)}</p>
                  {details.map((row) => (
                    <p key={row.label}>
                      {row.label}: {row.value}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
