import { MAX_MATCHES_PER_LEAD } from "@/lib/matching";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homepros.cartley.com";

export const site = {
  name: "HomePros",
  operator: "Cartley",
  domainLabel: "homepros.cartley.com",
  url: configuredUrl.replace(/\/$/, ""),
  supportEmail: "hello@homepros.cartley.com",
  maxMatches: MAX_MATCHES_PER_LEAD,
  description:
    "HomePros, run by Cartley, introduces homeowners to at most three local contractors. Contractors pay for the introduction. Homeowners do not.",
};
