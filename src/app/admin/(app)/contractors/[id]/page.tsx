import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContractorFields } from "@/components/contractor-fields";
import { buttonClass } from "@/components/ui";
import { prisma } from "@/lib/db";
import { one } from "@/lib/format";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading contractor…</p>}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) notFound();
  return (
    <div className="max-w-2xl">
      <Link href="/admin/contractors" className="text-sm font-semibold text-forest">
        All contractors
      </Link>
      <h1 className="mt-3 font-serif text-4xl">{contractor.businessName}</h1>
      {one(query.error) ? <p className="mt-3 text-sm text-danger">{one(query.error)}</p> : null}
      {one(query.saved) ? <p className="mt-3 text-sm text-good">Saved.</p> : null}
      <form action={`/api/admin/contractors/${contractor.id}`} method="post" className="mt-6 rounded-3xl border border-line bg-card p-5">
        <ContractorFields
          values={contractor}
          showStatus
          showCap
          passwordHint="Leave blank to keep the current password."
        />
        <button className={`${buttonClass()} mt-6`} type="submit">
          Save contractor
        </button>
      </form>
    </div>
  );
}
