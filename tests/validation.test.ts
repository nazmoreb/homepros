import { describe, expect, it } from "vitest";
import { categories, exampleProjectDetails } from "@/lib/categories";
import {
  parseZips,
  validateContractor,
  validateLead,
  validateQuoteStep,
  type ContractorDraft,
  type QuoteDraft,
} from "@/lib/validation";

function draft(overrides: Partial<QuoteDraft> = {}): QuoteDraft {
  return {
    zip: "78704",
    category: "ROOFING",
    projectDetails: { ...exampleProjectDetails("ROOFING"), subtype: "shingle" },
    timeline: "asap",
    homeownerStatus: "owner_occupied",
    firstName: "Avery",
    lastName: "Quinn",
    email: "avery@example.com",
    phone: "(512) 555-0148",
    consentAccepted: true,
    ...overrides,
  };
}

describe("quote steps", () => {
  it("requires a 5-digit ZIP", () => {
    expect(validateQuoteStep("zip", draft({ zip: "7870" })).zip).toMatch(/5-digit/);
    expect(validateQuoteStep("zip", draft({ zip: "78704" }))).toEqual({});
  });

  it("requires a known project type", () => {
    expect(validateQuoteStep("project", draft({ category: "POOLS" })).category).toBeTruthy();
    expect(validateQuoteStep("project", draft({ category: "hvac" }))).toEqual({});
  });

  it("accepts shingle and metal roof details and rejects anything else", () => {
    expect(validateQuoteStep("details", draft({ projectDetails: { ...exampleProjectDetails("ROOFING"), subtype: "metal" } }))).toEqual({});
    expect(validateQuoteStep("details", draft({ projectDetails: { ...exampleProjectDetails("ROOFING"), subtype: "tile" } }))["details.subtype"]).toBeTruthy();
  });

  it("validates every launch category, including gutter guards", () => {
    for (const category of categories) {
      const errors = validateQuoteStep(
        "details",
        draft({ category: category.id, projectDetails: exampleProjectDetails(category.id) }),
      );
      expect(errors, category.id).toEqual({});
    }
    const gutters = exampleProjectDetails("GUTTERS");
    expect(gutters.service).toBe("install");
    expect(
      validateQuoteStep("details", draft({ category: "GUTTERS", projectDetails: { ...gutters, service: "guards", guards: "yes" } })),
    ).toEqual({});
  });

  it("checks timeline, homeowner status, and contact info", () => {
    expect(validateQuoteStep("timeline", draft({ timeline: "whenever" })).timeline).toBeTruthy();
    expect(validateQuoteStep("homeowner", draft({ homeownerStatus: "guest" })).homeownerStatus).toBeTruthy();
    const contact = validateQuoteStep(
      "contact",
      draft({ firstName: "", email: "not-an-email", phone: "555" }),
    );
    expect(contact.firstName).toBeTruthy();
    expect(contact.email).toBeTruthy();
    expect(contact.phone).toBeTruthy();
    expect(validateQuoteStep("contact", draft({ phone: "1 (512) 555-0148" }))).toEqual({});
  });

  it("requires the consent checkbox", () => {
    expect(validateQuoteStep("consent", draft({ consentAccepted: false })).consentAccepted).toBeTruthy();
  });
});

describe("validateLead", () => {
  it("accepts a full roofing request and normalizes phone and email", () => {
    const result = validateLead({
      ...draft(),
      consentText: "I agree that the named roofers may contact me about this project.",
      pageUrl: "https://homepros.cartley.com/quote?zip=78704",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.phone).toBe("5125550148");
    expect(result.data.email).toBe("avery@example.com");
    expect(result.data.category).toBe("ROOFING");
  });

  it("rejects a missing consent statement and a filled honeypot", () => {
    const missing = validateLead({ ...draft(), consentText: "too short", pageUrl: "" });
    expect(missing.ok).toBe(false);
    const bot = validateLead({
      ...draft(),
      consentText: "I agree that the named roofers may contact me about this project.",
      honeypot: "https://spam.example",
    });
    expect(bot.ok).toBe(false);
  });
});

describe("contractor profile", () => {
  const profile: ContractorDraft = {
    businessName: "Hill Country Roofing",
    contactName: "Sam Hill",
    email: "sam@hillcountry.example",
    phone: "5125550101",
    categories: ["ROOFING", "nope"],
    serviceZips: ["78704, 78745"],
    city: "Austin",
    state: "tx",
    bio: "Local roofs.",
    licenseNumber: "ROC-1",
    yearsInBusiness: "12",
    monthlyLeadCap: "",
    webhookUrl: "",
    webhookSecret: "",
    status: "APPROVED",
    password: "HomeProsPortal!2026",
  };

  it("keeps known categories, parses ZIPs, and treats a blank cap as unlimited", () => {
    const result = validateContractor(profile, { requirePassword: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.categories).toEqual(["ROOFING"]);
    expect(result.data.serviceZips).toEqual(["78704", "78745"]);
    expect(result.data.monthlyLeadCap).toBeNull();
    expect(result.data.state).toBe("TX");
  });

  it("requires a password on create and at least one ZIP", () => {
    expect(validateContractor({ ...profile, password: "short" }, { requirePassword: true }).ok).toBe(false);
    expect(validateContractor({ ...profile, serviceZips: ["nope"] }, { requirePassword: false }).ok).toBe(false);
    expect(parseZips("Austin 78704 and 80205")).toEqual(["78704", "80205"]);
  });
});
