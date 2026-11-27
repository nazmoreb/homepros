"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  categories,
  homeownerStatuses,
  resolveCategory,
  timelines,
  type Category,
} from "@/lib/categories";
import {
  quoteSteps,
  validateQuoteStep,
  type FieldErrors,
  type QuoteDraft,
  type QuoteStep,
} from "@/lib/validation";
import { parseAttributionCookie } from "@/lib/attribution";
import { track, trackLeadSubmitted } from "@/lib/tracking";
import { ChoiceCards, TextInput, buttonClass } from "@/components/ui";

type MatchRow = {
  id: string;
  businessName: string;
  city: string | null;
  state: string | null;
};

const titles: Record<QuoteStep, string> = {
  zip: "Where is the project?",
  project: "What needs work?",
  details: "Tell us about the project",
  timeline: "When should it start?",
  homeowner: "What is your relationship to the home?",
  contact: "How should they reach you?",
  consent: "Who may contact you?",
};

const intros: Record<QuoteStep, string> = {
  zip: "We only share a request with pros who serve this ZIP.",
  project: "Pick one trade. You can start another request later.",
  details: "These answers go to the matched pros with your contact details.",
  timeline: "Contractors use this to decide if they can take the job.",
  homeowner: "Renters can still ask. Contractors will see your answer.",
  contact: "This is the last step before we show you who matched.",
  consent: "Nothing is saved until you agree to the statement and submit.",
};

function readAttrCookie() {
  const raw = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("hp_attr="))
    ?.slice("hp_attr=".length);
  return parseAttributionCookie(raw);
}

export function QuoteForm({ initialZip, initialCategory }: { initialZip: string; initialCategory: string }) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const resolved = resolveCategory(initialCategory);
  const [step, setStep] = useState<QuoteStep>("zip");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [consentText, setConsentText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [started, setStarted] = useState(false);
  const [draft, setDraft] = useState<QuoteDraft>({
    zip: initialZip.replace(/\D/g, "").slice(0, 5),
    category: resolved?.id ?? "",
    projectDetails: {},
    timeline: "",
    homeownerStatus: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consentAccepted: false,
  });

  const index = quoteSteps.indexOf(step);
  const category = resolveCategory(draft.category);

  function markStarted() {
    if (started) return;
    setStarted(true);
    track("quote_started", { category: draft.category || undefined });
  }

  function update(partial: Partial<QuoteDraft>) {
    markStarted();
    setDraft((current) => ({ ...current, ...partial }));
  }

  function go(next: QuoteStep) {
    setStep(next);
    setFormError("");
    topRef.current?.scrollIntoView({ block: "start" });
  }

  async function loadMatches(zip: string, categoryId: string) {
    setLoadingMatches(true);
    setFormError("");
    try {
      const response = await fetch(`/api/match?zip=${encodeURIComponent(zip)}&category=${encodeURIComponent(categoryId)}`);
      const body = (await response.json()) as {
        error?: string;
        contractors?: MatchRow[];
        consentText?: string;
      };
      if (!response.ok || !body.consentText) {
        setFormError(body.error || "We could not check coverage for that ZIP.");
        setMatches([]);
        setConsentText("");
        return;
      }
      setMatches(body.contractors ?? []);
      setConsentText(body.consentText);
      update({ consentAccepted: false });
      track("matches_shown", { category: categoryId, zip, matched: body.contractors?.length ?? 0 });
    } catch {
      setFormError("We could not check coverage. Try again.");
    } finally {
      setLoadingMatches(false);
    }
  }

  async function onContinue() {
    const stepErrors = validateQuoteStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    track("quote_step_completed", { step, category: draft.category || undefined });
    const next = quoteSteps[index + 1];
    if (!next) return;
    if (next === "consent") {
      go("consent");
      await loadMatches(draft.zip, draft.category);
      return;
    }
    go(next);
  }

  async function onSubmit() {
    const stepErrors = validateQuoteStep("consent", draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0 || !consentText) return;
    setPending(true);
    setFormError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          consentText,
          pageUrl: window.location.href,
          honeypot,
          attribution: readAttrCookie(),
        }),
      });
      const body = (await response.json()) as {
        token?: string;
        error?: string;
        fields?: FieldErrors;
        consentText?: string;
        contractors?: MatchRow[];
        status?: string;
      };
      if (response.status === 409 && body.consentText) {
        setMatches(body.contractors ?? []);
        setConsentText(body.consentText);
        update({ consentAccepted: false });
        setFormError("The available pros changed. Review the updated names and agree again.");
        return;
      }
      if (!response.ok || !body.token) {
        setErrors(body.fields ?? {});
        setFormError(body.error || "We could not save this request.");
        return;
      }
      trackLeadSubmitted({
        category: draft.category,
        zip: draft.zip,
        matched: body.status === "UNMATCHED" ? 0 : matches.length,
      });
      router.push(`/quote/thank-you/${body.token}`);
    } catch {
      setFormError("We could not save this request. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={topRef} className="mx-auto w-full max-w-xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">
        Step {index + 1} of {quoteSteps.length}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full bg-forest" style={{ width: `${((index + 1) / quoteSteps.length) * 100}%` }} />
      </div>
      <h1 className="mt-4 font-serif text-4xl leading-tight">{titles[step]}</h1>
      <p className="mt-2 text-ink-soft">{intros[step]}</p>

      <div className="relative mt-6 rounded-3xl border border-line bg-card p-5">
        {step === "zip" ? (
          <TextInput
            label="ZIP code"
            name="zip"
            value={draft.zip}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            error={errors.zip}
            onChange={(zip) => update({ zip: zip.replace(/\D/g, "").slice(0, 5) })}
          />
        ) : null}

        {step === "project" ? (
          <fieldset>
            <legend className="text-lg font-semibold">Project type</legend>
            <div className="mt-4 grid gap-2">
              {categories.map((item) => {
                const selected = draft.category === item.id;
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 ${
                      selected ? "border-forest bg-[#eef5f0]" : "border-line hover:border-moss"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={item.id}
                      checked={selected}
                      onChange={() => update({ category: item.id, projectDetails: {} })}
                      className="mt-1 accent-forest"
                    />
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="block text-sm text-ink-soft">{item.blurb}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.category ? (
              <p role="alert" className="mt-2 text-sm text-danger">
                {errors.category}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {step === "details" && category ? <DetailFields category={category} draft={draft} errors={errors} update={update} /> : null}

        {step === "timeline" ? (
          <ChoiceCards
            legend="Timeline"
            name="timeline"
            value={draft.timeline}
            options={timelines}
            error={errors.timeline}
            onChange={(timeline) => update({ timeline })}
          />
        ) : null}

        {step === "homeowner" ? (
          <ChoiceCards
            legend="Homeowner status"
            name="homeownerStatus"
            value={draft.homeownerStatus}
            options={homeownerStatuses}
            error={errors.homeownerStatus}
            onChange={(homeownerStatus) => update({ homeownerStatus })}
          />
        ) : null}

        {step === "contact" ? (
          <div className="grid gap-4">
            <TextInput label="First name" name="firstName" autoComplete="given-name" value={draft.firstName} error={errors.firstName} onChange={(firstName) => update({ firstName })} />
            <TextInput label="Last name" name="lastName" autoComplete="family-name" value={draft.lastName} error={errors.lastName} onChange={(lastName) => update({ lastName })} />
            <TextInput label="Email" name="email" type="email" autoComplete="email" inputMode="email" value={draft.email} error={errors.email} onChange={(email) => update({ email })} />
            <TextInput label="Mobile phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={draft.phone} error={errors.phone} onChange={(phone) => update({ phone })} />
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Company website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === "consent" ? (
          <ConsentStep
            draft={draft}
            category={category}
            loading={loadingMatches}
            matches={matches}
            consentText={consentText}
            error={errors.consentAccepted}
            onToggle={(consentAccepted) => update({ consentAccepted })}
            onEdit={go}
          />
        ) : null}

        {formError ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {formError}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          {index > 0 ? (
            <button type="button" className={buttonClass("ghost")} onClick={() => go(quoteSteps[index - 1]!)}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step === "consent" ? (
            <button type="button" className={buttonClass()} disabled={pending || loadingMatches || !consentText} onClick={() => void onSubmit()}>
              {pending ? "Sending…" : "Submit request"}
            </button>
          ) : (
            <button type="button" className={buttonClass()} onClick={() => void onContinue()}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailFields({
  category,
  draft,
  errors,
  update,
}: {
  category: Category;
  draft: QuoteDraft;
  errors: FieldErrors;
  update: (partial: Partial<QuoteDraft>) => void;
}) {
  return (
    <div className="grid gap-6">
      {category.fields.map((field) => (
        <ChoiceCards
          key={field.name}
          legend={field.label}
          hint={field.hint}
          name={field.name}
          value={draft.projectDetails[field.name] ?? ""}
          options={field.options}
          error={errors[`details.${field.name}`]}
          onChange={(value) =>
            update({ projectDetails: { ...draft.projectDetails, [field.name]: value } })
          }
        />
      ))}
    </div>
  );
}

function ConsentStep({
  draft,
  category,
  loading,
  matches,
  consentText,
  error,
  onToggle,
  onEdit,
}: {
  draft: QuoteDraft;
  category: Category | undefined;
  loading: boolean;
  matches: MatchRow[];
  consentText: string;
  error?: string;
  onToggle: (value: boolean) => void;
  onEdit: (step: QuoteStep) => void;
}) {
  return (
    <div className="grid gap-4">
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-3 border-b border-line py-2">
          <dt className="text-ink-soft">ZIP</dt>
          <dd className="font-medium">{draft.zip}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-line py-2">
          <dt className="text-ink-soft">Project</dt>
          <dd className="font-medium">{category?.label}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-line py-2">
          <dt className="text-ink-soft">Contact</dt>
          <dd className="text-right font-medium">
            {draft.firstName} {draft.lastName}
            <span className="block font-normal text-ink-soft">{draft.email}</span>
          </dd>
        </div>
      </dl>
      <button type="button" className="text-left text-sm font-semibold text-forest" onClick={() => onEdit("zip")}>
        Edit answers
      </button>
      {loading ? <p>Checking who covers {draft.zip}…</p> : null}
      {!loading && matches.length > 0 ? (
        <div>
          <p className="font-semibold">These businesses matched</p>
          <ul className="mt-2 space-y-2">
            {matches.map((match) => (
              <li key={match.id} className="rounded-2xl bg-paper px-4 py-3">
                <span className="block font-semibold">{match.businessName}</span>
                <span className="text-sm text-ink-soft">{[match.city, match.state].filter(Boolean).join(", ")}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {!loading && consentText && matches.length === 0 ? (
        <div className="rounded-2xl border border-copper/40 bg-cream px-4 py-3 text-sm leading-relaxed">
          Nobody on HomePros covers {category?.label.toLowerCase()} in {draft.zip} right now. We will still save your request, and we will not pass it to a contractor.
        </div>
      ) : null}
      {consentText ? (
        <label className="flex items-start gap-3 rounded-2xl border border-line px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 accent-forest"
            checked={draft.consentAccepted}
            onChange={(event) => onToggle(event.target.checked)}
          />
          <span className="text-sm leading-relaxed">{consentText}</span>
        </label>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
