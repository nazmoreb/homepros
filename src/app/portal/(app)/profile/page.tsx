import { Suspense } from "react";
import { ContractorFields } from "@/components/contractor-fields";
import { buttonClass } from "@/components/ui";
import { requireContractor } from "@/lib/auth";
import { one } from "@/lib/format";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <Profile searchParams={searchParams} />
    </Suspense>
  );
}

async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
}) {
  const { contractor } = await requireContractor();
  const params = await searchParams;
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Profile</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Update the trades and ZIP codes you want to be matched on. Status and the monthly cap are set by HomePros.
      </p>
      {one(params.error) ? <p className="mt-3 text-sm text-danger">{one(params.error)}</p> : null}
      {one(params.saved) ? <p className="mt-3 text-sm text-good">Saved.</p> : null}
      <form action="/api/portal/profile" method="post" className="mt-6 rounded-3xl border border-line bg-card p-5">
        <ContractorFields
          values={contractor}
          showStatus={false}
          showCap={false}
          passwordHint="Leave blank to keep the current password."
        />
        <button className={`${buttonClass()} mt-6`} type="submit">
          Save profile
        </button>
      </form>
    </div>
  );
}
