import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPanel } from "@/components/login-panel";

export const metadata: Metadata = {
  title: "Admin sign-in",
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
        role="ADMIN"
        title="Admin"
        lede="Cartley staff only. Contractors use the pro login."
      />
    </Suspense>
  );
}
