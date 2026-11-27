import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPanel } from "@/components/login-panel";

export const metadata: Metadata = {
  title: "Contractor sign-in",
  robots: { index: false, follow: false },
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Loading sign-in…</p>}>
      <LoginPanel
        searchParams={searchParams}
        role="CONTRACTOR"
        title="Contractor portal"
        lede="See the leads HomePros assigned to your business, and keep your ZIP codes current."
      />
    </Suspense>
  );
}
