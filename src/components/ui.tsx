import type { ReactNode } from "react";
import type { Choice } from "@/lib/categories";

export function buttonClass(variant: "primary" | "secondary" | "ghost" = "primary") {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  if (variant === "secondary") return `${base} border border-line bg-card text-ink hover:border-forest`;
  if (variant === "ghost") return `${base} text-forest hover:bg-cream`;
  return `${base} bg-forest text-paper hover:bg-forest-deep`;
}

export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-12">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 font-serif text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">{lede}</p>
    </header>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-3xl border border-line bg-card">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-4">
          <summary className="cursor-pointer list-none font-semibold text-ink">
            <span className="mr-2 text-copper group-open:hidden">+</span>
            <span className="mr-2 hidden text-copper group-open:inline">–</span>
            {item.q}
          </summary>
          <p className="mt-2 pl-5 text-sm leading-relaxed text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function ChoiceCards({
  legend,
  name,
  value,
  options,
  onChange,
  error,
  hint,
}: {
  legend: string;
  name: string;
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold text-ink">{legend}</legend>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
      <div className="mt-4 grid gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${
                selected ? "border-forest bg-[#eef5f0]" : "border-line bg-card hover:border-moss"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-1 accent-forest"
              />
              <span className="font-medium">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function TextInput({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
  maxLength?: number;
}) {
  const id = `field-${name}`;
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none ring-copper focus:ring-2"
      />
      {error ? (
        <span role="alert" className="mt-1 block text-sm text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const tone =
    status === "APPROVED" || status === "ASSIGNED" || status === "SENT" || status === "LOGGED"
      ? "bg-[#e5f4ec] text-good"
      : status === "UNMATCHED" || status === "PENDING" || status === "VETTED"
        ? "bg-cream text-copper-deep"
        : status === "FAILED"
          ? "bg-[#f8e4e4] text-danger"
          : "bg-paper text-ink-soft";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}
