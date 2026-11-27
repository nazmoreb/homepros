import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Loading admin…</p>}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-white/10 bg-forest-deep text-paper md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0">
        <div className="px-4 py-5">
          <Link href="/admin" aria-label="Admin home">
            <Logo light />
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-paper/60">Admin</p>
        </div>
        <nav className="flex gap-2 px-3 pb-4 md:block md:space-y-1">
          {[
            ["/admin", "Overview"],
            ["/admin/leads", "Leads"],
            ["/admin/contractors", "Contractors"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="block rounded-full px-3 py-2 text-sm hover:bg-white/10">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm">
          <p className="truncate text-ink-soft">{user.email}</p>
          <form action="/api/auth/logout" method="post">
            <button className="font-semibold text-forest" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <main id="content" className="px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
