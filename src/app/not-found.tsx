import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-xl flex-1 px-4 py-20">
        <h1 className="font-serif text-4xl">That page is not on HomePros.</h1>
        <p className="mt-3 text-ink-soft">The link may be old, or the quote token does not match a request.</p>
        <Link href="/" className={`${buttonClass()} mt-6`}>
          Back home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
