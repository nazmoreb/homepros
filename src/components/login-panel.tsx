import { one } from "@/lib/format";
import { buttonClass } from "@/components/ui";
import { Logo } from "@/components/site-chrome";
import Link from "next/link";

export async function LoginPanel({
  searchParams,
  role,
  title,
  lede,
}: {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
  role: "ADMIN" | "CONTRACTOR";
  title: string;
  lede: string;
}) {
  const params = await searchParams;
  const error = one(params.error);
  const next = one(params.next);
  return (
    <main id="content" className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" aria-label="HomePros home">
        <Logo />
      </Link>
      <h1 className="mt-8 font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{lede}</p>
      <form action="/api/auth/login" method="post" className="mt-6 grid gap-4 rounded-3xl border border-line bg-card p-5">
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="next" value={next} />
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <label className="text-sm font-semibold">
          Email
          <input name="email" type="email" autoComplete="username" required className="mt-1 w-full rounded-2xl border border-line px-4 py-3" />
        </label>
        <label className="text-sm font-semibold">
          Password
          <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-2xl border border-line px-4 py-3" />
        </label>
        <button className={buttonClass()} type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
