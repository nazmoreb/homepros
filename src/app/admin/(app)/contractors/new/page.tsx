import { Suspense } from "react";
import { ContractorFields } from "@/components/contractor-fields";
import { buttonClass } from "@/components/ui";
import { one } from "@/lib/format";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading form…</p>}>
      <NewContractor searchParams={searchParams} />
    </Suspense>
  );
}

async function NewContractor({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const params = await searchParams;
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Add contractor</h1>
      <p className="mt-2 text-sm text-ink-soft">Creates a portal login. Leave them pending if they still need vetting.</p>
      <form action="/api/admin/contractors" method="post" className="mt-6 rounded-3xl border border-line bg-card p-5">
        {one(params.error) ? <p className="mb-4 text-sm text-danger">{one(params.error)}</p> : null}
        <ContractorFields showStatus showCap passwordHint="Required. At least 8 characters." />
        <button className={`${buttonClass()} mt-6`} type="submit">
          Create contractor
        </button>
      </form>
    </div>
  );
}
