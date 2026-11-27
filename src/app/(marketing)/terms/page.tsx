import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The rules for using HomePros as a homeowner or a contractor.",
};

export default function TermsPage() {
  return (
    <article className="legal mx-auto max-w-3xl px-4 pb-16">
      <PageIntro
        eyebrow="Terms"
        title="HomePros introduces people. It does not do the work."
        lede={`These terms cover the marketplace ${site.operator} runs at ${site.domainLabel}.`}
      />
      <div className="mt-8 space-y-4">
        <h2>The service</h2>
        <p>
          HomePros lets a homeowner describe a project and, when there is a match, introduces that request to at most {site.maxMatches} contractors. {site.operator} is not a contractor, not a party to the job, and not responsible for the price, quality, or timing of the work.
        </p>
        <h2>Homeowners</h2>
        <p>
          Requesting quotes is free. You agree to share your project with the businesses named on the consent step, or, if none are named, you agree that we may store the request without sharing it. Consent is not a condition of buying anything from those businesses. You are responsible for the accuracy of what you submit.
        </p>
        <h2>Contractors</h2>
        <p>
          A contractor account starts as pending. Leads are delivered only after {site.operator} marks the account approved, and only for ZIP codes and categories on the profile, subject to a monthly cap if one is set. Contractors pay HomePros for introductions. Charging that fee is outside this version of the product, but the relationship is not: the contractor is the party who pays for a lead.
        </p>
        <p>
          You may only contact a homeowner about the project they submitted, consistent with the consent stored on the lead. Returned or invalid leads can be marked by an admin and then stop counting as an active introduction.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not submit a request for someone else unless you are authorized. Do not scrape the marketplace, probe other people&apos;s leads, or use a contractor login to collect data outside your own assignments.
        </p>
        <h2>Disclaimers</h2>
        <p>
          Matching depends on the ZIP codes and categories contractors enter and on the status an admin sets. Coverage can be empty. The service is provided as available. To the extent the law allows, {site.operator} is not liable for indirect or consequential loss arising from an introduction or from the lack of one.
        </p>
        <h2>Contact</h2>
        <p>
          {site.supportEmail}. The domain {site.domainLabel} is a configuration placeholder until the production domain is chosen.
        </p>
      </div>
    </article>
  );
}
