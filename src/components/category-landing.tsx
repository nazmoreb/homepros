import Link from "next/link";
import type { Category } from "@/lib/categories";
import { faqs } from "@/lib/faq";
import { site } from "@/lib/site";
import { FaqList, PageIntro, buttonClass } from "@/components/ui";

export function CategoryLanding({ category }: { category: Category }) {
  return (
    <>
      <PageIntro eyebrow={category.label} title={`${category.label} quotes, capped at ${site.maxMatches}.`} lede={category.landingLead} />
      <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 px-4 sm:flex-row">
        <Link href={`/quote?category=${category.slug}`} className={buttonClass()}>
          Get free {category.label.toLowerCase()} quotes
        </Link>
        <Link href="/quote" className={buttonClass("secondary")}>
          Start with a different project
        </Link>
      </div>
      <section className="mx-auto mt-10 grid max-w-3xl gap-4 px-4">
        <ul className="grid gap-3">
          {category.bullets.map((bullet) => (
            <li key={bullet} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
              {bullet}
            </li>
          ))}
        </ul>
        <div className="rounded-3xl bg-paper-2 p-5">
          <h2 className="font-serif text-2xl">What the form will ask</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>Your ZIP code</li>
            <li>Project type, already set to {category.label}</li>
            {category.fields.map((field) => (
              <li key={field.name}>{field.label}</li>
            ))}
            <li>Timeline</li>
            <li>Whether you own the home</li>
            <li>Name, email, and phone</li>
            <li>A consent box that names the matched companies</li>
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-serif text-3xl">Before you share a number</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {site.operator} will not show you a rotating list of advertisers. You see the businesses that match, up to {site.maxMatches}, and you agree to those names. Contractors pay HomePros for that introduction.
        </p>
        <div className="mt-6">
          <FaqList items={faqs.slice(0, 4)} />
        </div>
      </section>
    </>
  );
}
