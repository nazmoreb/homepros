import Link from "next/link";
import { categories } from "@/lib/categories";
import { faqs } from "@/lib/faq";
import { site } from "@/lib/site";
import { FaqList, buttonClass } from "@/components/ui";

export function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
            Run by {site.operator}
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
            Up to three local pros. Named before they call.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            HomePros collects your project, then shares it with at most {site.maxMatches} vetted contractors who work in your ZIP. They pay us for the introduction. You do not.
          </p>
          <form action="/quote" method="get" className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">ZIP code</span>
              <input
                name="zip"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                minLength={5}
                placeholder="ZIP code"
                required
                className="w-full rounded-full border border-line bg-card px-5 py-3 text-base outline-none ring-copper focus:ring-2"
              />
            </label>
            <button className={buttonClass()}>Get free quotes</button>
          </form>
          <p className="mt-3 text-sm text-ink-soft">Contact info comes last. Consent names the actual companies.</p>
        </div>
        <div className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">What you will see</p>
          <p className="mt-2 font-serif text-2xl">An example, not a live match</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-2xl bg-paper px-4 py-3">
              <span className="block font-semibold">Hill Country Roofing</span>
              <span className="text-ink-soft">Austin, TX · shingle and metal</span>
            </li>
            <li className="rounded-2xl bg-paper px-4 py-3">
              <span className="block font-semibold">Live Oak Metal Roofs</span>
              <span className="text-ink-soft">Austin, TX · metal</span>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Before you submit, the form lists the real businesses for your ZIP. You check a box that names them. If the list is empty, we tell you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 sm:grid-cols-3">
        {[
          ["At most 3", "pros contacted per request"],
          ["$0", "for homeowners to ask"],
          ["Named", "consent, one business at a time"],
        ].map(([title, text]) => (
          <div key={title} className="rounded-3xl border border-line bg-paper-2 px-5 py-4">
            <p className="font-serif text-3xl text-forest">{title}</p>
            <p className="text-sm text-ink-soft">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl">Launch categories</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="rounded-3xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-forest"
            >
              <h3 className="font-serif text-2xl">{category.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{category.blurb}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-forest">Start a {category.label.toLowerCase()} request</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="font-serif text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Tell us about the job", "ZIP first, then the project, then timing. Your phone number is the last thing we ask for."],
            ["2", "We name the matches", `Up to ${site.maxMatches} approved pros who cover that ZIP and trade. Pending or merely vetted companies stay out.`],
            ["3", "You agree, then they get it", "The checkbox quotes the exact companies. We email each one, and call their webhook if they set one."],
          ].map(([step, title, body]) => (
            <li key={step} className="rounded-3xl bg-forest px-5 py-6 text-paper">
              <span className="font-serif text-4xl text-copper">{step}</span>
              <h3 className="mt-3 font-serif text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/80">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl">The part most lead sites mumble</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-line bg-card p-5">
            <h3 className="font-serif text-2xl">How pros are vetted</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              A person on Cartley&apos;s team marks a contractor vetted, then approved, before a lead can reach them. Approved means we have their business, contact, categories, and ZIP codes. It is a manual status, not an automated background-check API.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-card p-5">
            <h3 className="font-serif text-2xl">Contractors pay us</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Contractors pay HomePros for introductions. Homeowners do not pay us to request quotes. Billing is not part of this version, but the relationship is: you are not the customer we charge.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-card p-5">
            <h3 className="font-serif text-2xl">At most three calls</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              A lead is shared with at most {site.maxMatches} matched contractors. If your ZIP has one roofer on the list, you will see one name. We will not pad the list.
            </p>
          </article>
        </div>
        <p className="mt-4 rounded-3xl border border-copper/40 bg-cream px-5 py-4 text-sm leading-relaxed text-ink">
          Honest limit: if no approved pro covers the job, we store the lead anyway and the thank-you page says nobody was matched. We do not pretend otherwise.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-4">
        <h2 className="font-serif text-3xl">Questions</h2>
        <div className="mt-6">
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-4 rounded-[2rem] bg-ink px-6 py-8 text-paper sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-3xl">Ready when you are.</h2>
            <p className="mt-2 max-w-lg text-sm text-paper/75">
              The quote form takes a few minutes. You can leave before contact info and nothing is saved.
            </p>
          </div>
          <Link href="/quote" className={`${buttonClass()} bg-copper hover:bg-copper-deep`}>
            Get free quotes
          </Link>
        </div>
      </section>
    </>
  );
}
