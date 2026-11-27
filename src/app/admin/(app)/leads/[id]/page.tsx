import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  categoryLabel,
  formatPhone,
  formatProjectDetails,
  formatWhen,
  homeownerLabel,
  leadStatusLabel,
  one,
  personName,
  timelineLabel,
} from "@/lib/format";
import { StatusPill, buttonClass } from "@/components/ui";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading lead…</p>}>
      <LeadDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function LeadDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignments: { include: { contractor: true }, orderBy: { createdAt: "asc" } },
      deliveries: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!lead) notFound();
  const details = formatProjectDetails(lead.category, lead.projectDetails);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/leads" className="text-sm font-semibold text-forest">
        All leads
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl">{personName(lead.firstName, lead.lastName)}</h1>
        <StatusPill status={lead.status} label={leadStatusLabel(lead.status)} />
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {categoryLabel(lead.category)} in {lead.zip} · {formatWhen(lead.createdAt)}
      </p>
      {one(query.error) ? <p className="mt-3 text-sm text-danger">{one(query.error)}</p> : null}
      {one(query.saved) ? <p className="mt-3 text-sm text-good">Updated.</p> : null}

      <section className="mt-6 grid gap-3 rounded-3xl border border-line bg-card p-5 text-sm sm:grid-cols-2">
        <p>Email {lead.email}</p>
        <p>Phone {formatPhone(lead.phone)}</p>
        <p>Timeline {timelineLabel(lead.timeline)}</p>
        <p>Home {homeownerLabel(lead.homeownerStatus)}</p>
        {details.map((row) => (
          <p key={row.label}>
            {row.label}: {row.value}
          </p>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Assignments</h2>
        {lead.assignments.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No contractor was matched. The lead is stored anyway.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {lead.assignments.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-sm">
                <span>
                  <Link href={`/admin/contractors/${assignment.contractorId}`} className="font-semibold text-forest">
                    {assignment.contractor.businessName}
                  </Link>
                  <span className="block text-ink-soft">{assignment.contractor.email}</span>
                </span>
                <StatusPill status={assignment.status} label={leadStatusLabel(assignment.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Consent record</h2>
        <div className="mt-3 rounded-3xl border border-line bg-paper-2 p-4 text-sm leading-relaxed">
          <p>{lead.consentText}</p>
          <dl className="mt-4 grid gap-1 text-ink-soft">
            <div>Time: {formatWhen(lead.consentAt)}</div>
            <div>IP: {lead.consentIp}</div>
            <div className="break-all">User agent: {lead.consentUserAgent}</div>
            <div className="break-all">Page: {lead.consentPageUrl}</div>
          </dl>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Attribution</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {[
            ["utm_source", lead.utmSource],
            ["utm_medium", lead.utmMedium],
            ["utm_campaign", lead.utmCampaign],
            ["utm_term", lead.utmTerm],
            ["utm_content", lead.utmContent],
            ["gclid", lead.gclid],
            ["fbclid", lead.fbclid],
          ]
            .filter((entry) => entry[1])
            .map((entry) => `${entry[0]}=${entry[1]}`)
            .join(" · ") || "No campaign parameters on this lead."}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Delivery</h2>
        {lead.deliveries.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No email or webhook was sent.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {lead.deliveries.map((delivery) => (
              <li key={delivery.id} className="rounded-2xl border border-line bg-card px-4 py-3">
                <span className="font-semibold">{delivery.channel}</span> via {delivery.provider} to {delivery.target}
                <span className="mt-1 block text-ink-soft">
                  {delivery.status}: {delivery.detail}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lead.notes ? (
        <section className="mt-6">
          <h2 className="font-serif text-2xl">Notes</h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-paper-2 p-4 text-sm">{lead.notes}</pre>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {["RETURNED", "INVALID"].map((status) => (
          <form key={status} action={`/api/admin/leads/${lead.id}`} method="post" className="rounded-3xl border border-line bg-card p-4">
            <input type="hidden" name="status" value={status} />
            <label className="block text-sm font-semibold">
              Note for {leadStatusLabel(status).toLowerCase()}
              <input name="note" className="mt-1 w-full rounded-2xl border border-line px-3 py-2 font-normal" />
            </label>
            <button className={`${buttonClass(status === "INVALID" ? "secondary" : "primary")} mt-3`} type="submit">
              Mark {leadStatusLabel(status).toLowerCase()}
            </button>
          </form>
        ))}
      </section>
    </div>
  );
}
