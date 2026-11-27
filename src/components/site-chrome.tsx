import Link from "next/link";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif text-xl tracking-tight ${light ? "text-paper" : "text-ink"}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? "#f4efe6" : "#1e4d3a"} />
        <path d="M7 15.5 16 8l9 7.5V25a1 1 0 0 1-1 1h-5.2v-5.2h-5.6V26H8a1 1 0 0 1-1-1v-9.5Z" fill={light ? "#1e4d3a" : "#f4efe6"} />
        <path d="M13.2 26.8V21h5.6v5.8" fill="#c4622d" />
      </svg>
      HomePros
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="HomePros home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium sm:gap-4">
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full px-3 py-2 text-ink-soft hover:bg-card hover:text-ink">
              Projects
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-line bg-card p-2 shadow-lg">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="block rounded-xl px-3 py-2 hover:bg-paper"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/contractors" className="hidden rounded-full px-3 py-2 text-ink-soft hover:bg-card hover:text-ink sm:inline">
            For pros
          </Link>
          <Link href="/quote" className="rounded-full bg-forest px-4 py-2 text-paper hover:bg-forest-deep">
            Get free quotes
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-forest-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-paper/80">
            {site.operator} runs HomePros. Homeowners request quotes. Contractors pay for the introduction. At most {site.maxMatches} pros per request.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-copper">Projects</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/${category.slug}`} className="text-paper/85 hover:text-paper">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-copper">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/quote" className="text-paper/85 hover:text-paper">Get free quotes</Link></li>
            <li><Link href="/contractors" className="text-paper/85 hover:text-paper">Contractor sign-up</Link></li>
            <li><Link href="/portal/login" className="text-paper/85 hover:text-paper">Contractor login</Link></li>
            <li><Link href="/privacy" className="text-paper/85 hover:text-paper">Privacy</Link></li>
            <li><Link href="/terms" className="text-paper/85 hover:text-paper">Terms</Link></li>
            <li><Link href="/admin/login" className="text-paper/85 hover:text-paper">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-paper/70">
        © 2026 {site.operator}. HomePros is a marketplace, not a contractor. Placeholder domain: {site.domainLabel}.
      </div>
    </footer>
  );
}
