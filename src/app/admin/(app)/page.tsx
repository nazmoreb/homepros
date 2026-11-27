import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading overview…</p>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const [leads, unmatched, pending, approved] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "UNMATCHED" } }),
    prisma.contractor.count({ where: { status: "PENDING" } }),
    prisma.contractor.count({ where: { status: "APPROVED" } }),
  ]);
  const cards = [
    ["Leads", leads, "/admin/leads"],
    ["Unmatched", unmatched, "/admin/leads?status=UNMATCHED"],
    ["Pending pros", pending, "/admin/contractors"],
    ["Approved pros", approved, "/admin/contractors"],
  ] as const;
  return (
    <div>
      <h1 className="font-serif text-4xl">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Approve a contractor before they can be matched. Leads keep the consent text even when you mark them returned or invalid.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-3xl border border-line bg-card px-5 py-4">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="font-serif text-4xl">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
