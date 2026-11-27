import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { categoryLabel, formatPhone, homeownerThankYou, timelineLabel } from "@/lib/format";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Request received",
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center">Loading your request…</p>}>
      <ThankYou params={params} />
    </Suspense>
  );
}

async function ThankYou({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await prisma.lead.findUnique({
    where: { publicToken: token },
    include: { assignments: { include: { contractor: true } } },
  });
  if (!lead) notFound();
  const matched = lead.assignments.map((assignment) => assignment.contractor);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">Request saved</p>
      <h1 className="mt-2 font-serif text-4xl">
        {matched.length > 0 ? "These pros can contact you." : "We saved it. Nobody matched."}
      </h1>
      <p className="mt-3 text-ink-soft">
        {lead.firstName}, your {categoryLabel(lead.category).toLowerCase()} request for {lead.zip} is in. Timeline:{" "}
        {timelineLabel(lead.timeline)}. {homeownerThankYou(lead.homeownerStatus)}
      </p>
      {matched.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {matched.map((contractor) => (
            <li key={contractor.id} className="rounded-3xl border border-line bg-card px-5 py-4">
              <p className="font-serif text-2xl">{contractor.businessName}</p>
              <p className="text-sm text-ink-soft">
                {[contractor.city, contractor.state].filter(Boolean).join(", ")}
              </p>
              <p className="mt-2 text-sm">Phone {formatPhone(contractor.phone)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl border border-copper/40 bg-cream px-5 py-4 text-sm leading-relaxed">
          No approved HomePros contractor covers this project in {lead.zip}. We did not share your phone number. The request stays on file with the consent you gave us to store it.
        </div>
      )}
      <Link href="/" className={`${buttonClass("secondary")} mt-8`}>
        Back home
      </Link>
    </div>
  );
}
