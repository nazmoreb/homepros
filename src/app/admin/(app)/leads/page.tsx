import { Suspense } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { categoryLabel, formatWhen, leadStatusLabel, one, personName } from "@/lib/format";
import { leadWhere } from "@/lib/lead-filters";
import { StatusPill } from "@/components/ui";

const statuses = ["ASSIGNED", "UNMATCHED", "RETURNED", "INVALID"];

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; category?: string | string[]; zip?: string | string[]; q?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading leads…</p>}>
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

async function Leads({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; category?: string | string[]; zip?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const filters = {
    status: one(params.status),
    category: one(params.category),
    zip: one(params.zip),
    q: one(params.q),
  };
  const leads = await prisma.lead.findMany({
    where: leadWhere(filters),
    include: { assignments: { include: { contractor: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const exportQuery = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Leads</h1>
          <p className="mt-1 text-sm text-ink-soft">{leads.length} shown. Export uses the same filters.</p>
        </div>
        <a className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold" href={`/api/admin/leads/export${exportQuery ? `?${exportQuery}` : ""}`}>
          Export CSV
        </a>
      </div>
      <form method="get" className="mt-5 grid gap-2 rounded-3xl border border-line bg-card p-4 sm:grid-cols-5">
        <select name="status" defaultValue={filters.status} className="rounded-2xl border border-line px-3 py-2 text-sm" aria-label="Status">
          <option value="">Any status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabel(status)}
            </option>
          ))}
        </select>
        <select name="category" defaultValue={filters.category} className="rounded-2xl border border-line px-3 py-2 text-sm" aria-label="Category">
          <option value="">Any project</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <input name="zip" defaultValue={filters.zip} placeholder="ZIP" className="rounded-2xl border border-line px-3 py-2 text-sm" aria-label="ZIP" />
        <input name="q" defaultValue={filters.q} placeholder="Name, email, or phone" className="rounded-2xl border border-line px-3 py-2 text-sm" aria-label="Search" />
        <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper" type="submit">
          Filter
        </button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Homeowner</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">ZIP</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pros</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-ink-soft">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{formatWhen(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-forest">
                      {personName(lead.firstName, lead.lastName)}
                    </Link>
                    <span className="block text-ink-soft">{lead.email}</span>
                  </td>
                  <td className="px-4 py-3">{categoryLabel(lead.category)}</td>
                  <td className="px-4 py-3">{lead.zip}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={lead.status} label={leadStatusLabel(lead.status)} />
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignments.length === 0
                      ? "None"
                      : lead.assignments.map((assignment) => assignment.contractor.businessName).join(", ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
