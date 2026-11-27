import { site } from "@/lib/site";

export const faqs = [
  {
    q: "How many contractors will contact me?",
    a: `At most ${site.maxMatches}. We only introduce contractors who cover your ZIP and the trade you picked. If two match, two can contact you. If none match, nobody gets your request.`,
  },
  {
    q: "Do I pay HomePros?",
    a: "No. Homeowners do not pay HomePros to request quotes. Contractors pay HomePros for the introduction. The price of the work is between you and the contractor. We do not take a cut of the job.",
  },
  {
    q: "How are pros vetted?",
    a: "Cartley reviews a contractor before they can receive a lead. The status moves from pending, to vetted, to approved. Only approved contractors are matched. The review covers the business details, categories, and ZIP codes they gave us. This version does not run an automated license lookup. If that changes, this page will say so.",
  },
  {
    q: "Why do I have to check a box that names the companies?",
    a: "Those companies may call, text, or email you. The box is one-to-one consent for each named business, not a yes to a shared partner list. We store the exact words, the time, your IP address, your browser, and the page you were on.",
  },
  {
    q: "What if nobody covers my ZIP?",
    a: "We say so on the form, before you submit. We still save the request. We do not hand it to a company outside the match to fill a quota.",
  },
  {
    q: "What happens to ad click IDs?",
    a: "If you arrive from an ad, we store utm parameters, gclid, and fbclid on the lead. Pixel snippets and conversion events are hooked up, and they stay quiet until a measurement ID is configured.",
  },
];
