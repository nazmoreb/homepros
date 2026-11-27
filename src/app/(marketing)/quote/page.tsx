import { Suspense } from "react";
import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
import { one } from "@/lib/format";

export const metadata: Metadata = {
  title: "Get free quotes",
  description: "Tell HomePros about a home project. We match at most three local contractors and ask for consent by name.",
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string | string[]; category?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center">Loading the quote form…</p>}>
      <QuoteEntry searchParams={searchParams} />
    </Suspense>
  );
}

async function QuoteEntry({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string | string[]; category?: string | string[] }>;
}) {
  const params = await searchParams;
  return <QuoteForm initialZip={one(params.zip)} initialCategory={one(params.category)} />;
}
