import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What HomePros collects, who sees a lead, and how consent is stored.",
};

export default function PrivacyPage() {
  return (
    <article className="legal mx-auto max-w-3xl px-4 pb-16">
      <PageIntro
        eyebrow="Privacy"
        title="What we keep, and who sees it."
        lede={`${site.operator} operates HomePros at ${site.domainLabel}. This notice describes the homeowner quote flow in this version of the product.`}
      />
      <div className="mt-8 space-y-4">
        <h2>Who we are</h2>
        <p>
          HomePros is a lead introduction marketplace. {site.operator} collects a homeowner&apos;s project request and shares it with at most {site.maxMatches} matched contractors. Questions: {site.supportEmail}.
        </p>
        <h2>What homeowners submit</h2>
        <p>The quote form asks for, in order: ZIP code, project type, project details, timeline, homeowner status, then name, email, and phone. We also store:</p>
        <ul>
          <li>The exact consent statement you checked, the time, your IP address, your user agent, and the page URL.</li>
          <li>Campaign parameters when they are present: utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, and fbclid.</li>
          <li>Which contractors were matched, and whether an email or webhook delivery was logged, sent, or failed.</li>
        </ul>
        <h2>Who receives a lead</h2>
        <p>
          If contractors match, we share the project and your contact details with those businesses only, up to {site.maxMatches}. They can contact you because you consented to each of them by name. If nobody matches, we keep the request and do not hand it to a contractor.
        </p>
        <p>
          Contractors pay HomePros for introductions. We do not sell a homeowner list as a standing marketing audience. Ad pixels are not loaded unless a measurement ID is configured. The app still records a dataLayer event so conversion tracking can be turned on later.
        </p>
        <h2>Accounts</h2>
        <p>
          Contractor and admin accounts store an email and a password hash. Contractors can see the leads assigned to them and the profile they edit. Admins can see leads, consent records, and contractor accounts.
        </p>
        <h2>How long we keep it</h2>
        <p>
          Lead records, including the consent text and delivery log, stay until {site.operator} deletes them. Returned or invalid leads are marked, not silently erased. Email {site.supportEmail} to ask about a request.
        </p>
        <h2>Cookies</h2>
        <p>
          A session cookie keeps admins and contractors signed in. An attribution cookie, hp_attr, remembers ad parameters for 30 days so they can be attached to a later quote request.
        </p>
      </div>
    </article>
  );
}
