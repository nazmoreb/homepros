import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireContractor } from "@/lib/auth";
import { contractorStatusLabel } from "@/lib/format";
import { Logo } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Loading portal…</p>}>
      <PortalFrame>{children}</PortalFrame>
    </Suspense>
  );
}

async function PortalFrame({ children }: { children: React.ReactNode }) {
  const { contractor } = await requireContractor();
  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/portal" aria-label="Portal home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/portal" className="font-semibold">
              Leads
            </Link>
            <Link href="/portal/profile" className="font-semibold">
              Profile
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="font-semibold text-forest" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      {contractor.status !== "APPROVED" ? (
        <p className="bg-cream px-4 py-3 text-center text-sm">
          Your account is {contractorStatusLabel(contractor.status).toLowerCase()}. You will not receive new leads until Cartley approves you.
        </p>
      ) : null}
      <main id="content" className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
