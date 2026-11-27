import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContractorFields } from "@/components/contractor-fields";
import { TrackOnMount } from "@/components/tracking-hooks";
import { PageIntro, buttonClass } from "@/components/ui";
import { one } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contractor sign-up",
  description: "Apply to receive HomePros leads in the ZIP codes and trades you actually cover.",
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; submitted?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center">Loading sign-up…</p>}>
      <Signup searchParams={searchParams} />
    </Suspense>
  );
}

async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; submitted?: string | string[] }>;
}) {
  const params = await searchParams;
  const error = one(params.error);
  const submitted = one(params.submitted) === "1";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16">
      <PageIntro
        eyebrow="For contractors"
        title="Apply to be introduced. Approval comes first."
        lede={`HomePros, run by ${site.operator}, sends a lead to at most ${site.maxMatches} approved pros. New accounts stay pending until someone vets and approves them. You will not receive leads before that.`}
      />
      {submitted ? (
        <div className="mt-8 rounded-3xl border border-forest/30 bg-[#eef5f0] px-5 py-4 text-sm">
          <TrackOnMount event="contractor_signup" />
          Application received. You can sign in to edit your profile, and leads start only after approval.{" "}
          <Link href="/portal/login" className="font-semibold text-forest">
            Contractor login
          </Link>
        </div>
      ) : (
        <form action="/api/contractors/signup" method="post" className="mt-8 rounded-3xl border border-line bg-card p-5">
          {error ? (
            <p role="alert" className="mb-4 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <ContractorFields showStatus={false} showCap={false} passwordHint="At least 8 characters. This is your portal password." />
          <button className={`${buttonClass()} mt-6`} type="submit">
            Submit application
          </button>
        </form>
      )}
    </div>
  );
}
