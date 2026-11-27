import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { contractorStatusLabel } from "@/lib/format";
import { StatusPill, buttonClass } from "@/components/ui";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading contractors…</p>}>
      <Contractors />
    </Suspense>
  );
}

async function Contractors() {
  const contractors = await prisma.contractor.findMany({ orderBy: { businessName: "asc" } });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Contractors</h1>
          <p className="mt-1 text-sm text-ink-soft">Only approved pros are eligible for a match.</p>
        </div>
        <Link href="/admin/contractors/new" className={buttonClass()}>
          Add contractor
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Trades</th>
              <th className="px-4 py-3 font-medium">ZIPs</th>
              <th className="px-4 py-3 font-medium">Cap</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Vetting</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map((contractor) => (
              <tr key={contractor.id} className="border-b border-line align-top last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/contractors/${contractor.id}`} className="font-semibold text-forest">
                    {contractor.businessName}
                  </Link>
                  <span className="block text-ink-soft">{contractor.email}</span>
                </td>
                <td className="px-4 py-3">{contractor.categories.join(", ")}</td>
                <td className="px-4 py-3 max-w-40">{contractor.serviceZips.join(", ")}</td>
                <td className="px-4 py-3">{contractor.monthlyLeadCap ?? "None"}</td>
                <td className="px-4 py-3">
                  <StatusPill status={contractor.status} label={contractorStatusLabel(contractor.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {["VETTED", "APPROVED", "SUSPENDED"].map((status) => (
                      <form key={status} action={`/api/admin/contractors/${contractor.id}`} method="post">
                        <input type="hidden" name="intent" value="status" />
                        <input type="hidden" name="status" value={status} />
                        <button className="rounded-full border border-line px-2 py-1 text-xs" type="submit">
                          {status === "VETTED" ? "Vet" : status === "APPROVED" ? "Approve" : "Suspend"}
                        </button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
