import { z } from "zod";
import {
  type ContractorStatus,
  contractorStatuses,
  getCategoryById,
  homeownerStatuses,
  resolveCategory,
  timelines,
} from "@/lib/categories";

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

export type QuoteStep =
  | "zip"
  | "project"
  | "details"
  | "timeline"
  | "homeowner"
  | "contact"
  | "consent";

export const quoteSteps: QuoteStep[] = [
  "zip",
  "project",
  "details",
  "timeline",
  "homeowner",
  "contact",
  "consent",
];

export type QuoteDraft = {
  zip: string;
  category: string;
  projectDetails: Record<string, string>;
  timeline: string;
  homeownerStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentAccepted: boolean;
};

export type LeadSubmission = {
  zip: string;
  category: string;
  projectDetails: Record<string, string>;
  timeline: string;
  homeownerStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentAccepted: true;
  consentText: string;
  pageUrl: string;
};

const emailSchema = z.string().trim().email().max(200);

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizePhone(value: string): string | null {
  let digits = digitsOnly(value);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return digits;
}

export function normalizeZip(value: string): string | null {
  const zip = value.trim();
  return /^\d{5}$/.test(zip) ? zip : null;
}

function nameError(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1) return `Enter your ${label}.`;
  if (trimmed.length > 60) return `${label} must be 60 characters or fewer.`;
  if (/[<>]/.test(trimmed)) return `Enter a ${label} without brackets.`;
  return null;
}

export function validateProjectDetails(
  categoryId: string,
  details: Record<string, string>,
): FieldErrors {
  const errors: FieldErrors = {};
  const category = getCategoryById(categoryId);
  if (!category) {
    errors.category = "Choose a project type.";
    return errors;
  }

  const allowed = new Set(category.fields.map((field) => field.name));
  for (const key of Object.keys(details)) {
    if (!allowed.has(key)) {
      errors.projectDetails = "This project has an answer we do not ask for.";
    }
  }

  for (const field of category.fields) {
    const value = details[field.name];
    if (!value || !field.options.some((option) => option.value === value)) {
      errors[`details.${field.name}`] = `Choose an answer for ${field.label.replace(/\?$/, "").toLowerCase()}.`;
    }
  }

  return errors;
}

export function validateQuoteStep(step: QuoteStep, draft: QuoteDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (step === "zip") {
    if (!normalizeZip(draft.zip)) errors.zip = "Enter a 5-digit ZIP code.";
  }

  if (step === "project") {
    if (!resolveCategory(draft.category)) errors.category = "Choose a project type.";
  }

  if (step === "details") {
    Object.assign(errors, validateProjectDetails(draft.category, draft.projectDetails));
  }

  if (step === "timeline") {
    if (!timelines.some((option) => option.value === draft.timeline)) {
      errors.timeline = "Choose a timeline.";
    }
  }

  if (step === "homeowner") {
    if (!homeownerStatuses.some((option) => option.value === draft.homeownerStatus)) {
      errors.homeownerStatus = "Tell us your relationship to the home.";
    }
  }

  if (step === "contact") {
    const first = nameError(draft.firstName, "first name");
    const last = nameError(draft.lastName, "last name");
    if (first) errors.firstName = first;
    if (last) errors.lastName = last;
    if (!emailSchema.safeParse(draft.email).success) {
      errors.email = "Enter a valid email address.";
    }
    if (!normalizePhone(draft.phone)) {
      errors.phone = "Enter a 10-digit US phone number.";
    }
  }

  if (step === "consent" && !draft.consentAccepted) {
    errors.consentAccepted = "Check the box to agree to the statement above.";
  }

  return errors;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === "string");
}

export function validateLead(input: unknown): ValidationResult<LeadSubmission> {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: { form: "This request could not be read." } };
  }

  const raw = input as Record<string, unknown>;
  if (typeof raw.honeypot === "string" && raw.honeypot.trim()) {
    return { ok: false, errors: { form: "This request could not be accepted." } };
  }

  const draft: QuoteDraft = {
    zip: typeof raw.zip === "string" ? raw.zip : "",
    category: typeof raw.category === "string" ? raw.category : "",
    projectDetails: isStringRecord(raw.projectDetails) ? raw.projectDetails : {},
    timeline: typeof raw.timeline === "string" ? raw.timeline : "",
    homeownerStatus: typeof raw.homeownerStatus === "string" ? raw.homeownerStatus : "",
    firstName: typeof raw.firstName === "string" ? raw.firstName : "",
    lastName: typeof raw.lastName === "string" ? raw.lastName : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    consentAccepted: raw.consentAccepted === true,
  };

  const errors: FieldErrors = {};
  for (const step of quoteSteps) {
    Object.assign(errors, validateQuoteStep(step, draft));
  }

  const consentText = typeof raw.consentText === "string" ? raw.consentText.trim() : "";
  if (consentText.length < 20) {
    errors.consentText = "The consent statement is missing.";
  }
  if (consentText.length > 2000) {
    errors.consentText = "The consent statement is too long.";
  }

  const pageUrl = typeof raw.pageUrl === "string" ? raw.pageUrl.trim() : "";
  if (pageUrl.length > 1000) errors.pageUrl = "The page address is too long.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const category = resolveCategory(draft.category)!;
  const phone = normalizePhone(draft.phone)!;
  const zip = normalizeZip(draft.zip)!;

  return {
    ok: true,
    data: {
      zip,
      category: category.id,
      projectDetails: draft.projectDetails,
      timeline: draft.timeline,
      homeownerStatus: draft.homeownerStatus,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim().toLowerCase(),
      phone,
      consentAccepted: true,
      consentText,
      pageUrl,
    },
  };
}

export type ContractorDraft = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  serviceZips: string[];
  city: string;
  state: string;
  bio: string;
  licenseNumber: string;
  yearsInBusiness: string;
  monthlyLeadCap: string;
  webhookUrl: string;
  webhookSecret: string;
  status: string;
  password: string;
};

export type ContractorProfile = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  serviceZips: string[];
  city: string;
  state: string;
  bio: string;
  licenseNumber: string;
  yearsInBusiness: number | null;
  monthlyLeadCap: number | null;
  webhookUrl: string;
  webhookSecret: string;
  status: ContractorStatus;
  password: string;
};

export function parseZips(value: string): string[] {
  const found = value.match(/\b\d{5}\b/g) ?? [];
  return [...new Set(found)];
}

export function validateContractor(
  draft: ContractorDraft,
  options: { requirePassword: boolean },
): ValidationResult<ContractorProfile> {
  const errors: FieldErrors = {};
  const businessName = draft.businessName.trim();
  const contactName = draft.contactName.trim();

  if (businessName.length < 2 || businessName.length > 120) {
    errors.businessName = "Enter the business name.";
  }
  if (contactName.length < 2 || contactName.length > 80) {
    errors.contactName = "Enter a contact name.";
  }
  if (!emailSchema.safeParse(draft.email).success) {
    errors.email = "Enter a valid email address.";
  }
  if (!normalizePhone(draft.phone)) {
    errors.phone = "Enter a 10-digit US phone number.";
  }

  const selected = [...new Set(draft.categories.map((item) => item.toUpperCase()))].filter(
    (item) => getCategoryById(item),
  );
  if (selected.length === 0) errors.categories = "Choose at least one category.";

  const zips = draft.serviceZips.flatMap((zip) => parseZips(zip));
  const uniqueZips = [...new Set(zips)];
  if (uniqueZips.length === 0) errors.serviceZips = "Add at least one 5-digit ZIP code.";

  const state = draft.state.trim().toUpperCase();
  if (state && !/^[A-Z]{2}$/.test(state)) errors.state = "Use a 2-letter state code.";

  const city = draft.city.trim();
  if (city.length > 80) errors.city = "City is too long.";

  const bio = draft.bio.trim();
  if (bio.length > 1000) errors.bio = "Bio must be 1,000 characters or fewer.";

  const licenseNumber = draft.licenseNumber.trim();
  if (licenseNumber.length > 80) errors.licenseNumber = "License number is too long.";

  let years: number | null = null;
  if (draft.yearsInBusiness.trim()) {
    const parsed = Number(draft.yearsInBusiness);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      errors.yearsInBusiness = "Enter years in business as a whole number from 0 to 100.";
    } else {
      years = parsed;
    }
  }

  let monthlyLeadCap: number | null = null;
  if (draft.monthlyLeadCap.trim()) {
    const parsed = Number(draft.monthlyLeadCap);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
      errors.monthlyLeadCap = "Enter a monthly cap as a whole number, or leave it blank.";
    } else {
      monthlyLeadCap = parsed;
    }
  }

  const webhookUrl = draft.webhookUrl.trim();
  if (webhookUrl) {
    try {
      const url = new URL(webhookUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        errors.webhookUrl = "Webhook URL must start with http or https.";
      }
    } catch {
      errors.webhookUrl = "Enter a valid webhook URL, or leave it blank.";
    }
    if (webhookUrl.length > 500) errors.webhookUrl = "Webhook URL is too long.";
  }

  if (draft.webhookSecret.trim().length > 200) {
    errors.webhookSecret = "Webhook secret must be 200 characters or fewer.";
  }

  const status = draft.status.toUpperCase();
  if (!contractorStatuses.includes(status as ContractorStatus)) {
    errors.status = "Choose a status.";
  }

  const password = draft.password;
  if (options.requirePassword && password.length < 8) {
    errors.password = "Use a password of at least 8 characters.";
  }
  if (password && password.length < 8) {
    errors.password = "Use a password of at least 8 characters.";
  }
  if (password.length > 72) errors.password = "Password must be 72 characters or fewer.";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      businessName,
      contactName,
      email: draft.email.trim().toLowerCase(),
      phone: normalizePhone(draft.phone)!,
      categories: selected,
      serviceZips: uniqueZips,
      city,
      state,
      bio,
      licenseNumber,
      yearsInBusiness: years,
      monthlyLeadCap,
      webhookUrl,
      webhookSecret: draft.webhookSecret.trim(),
      status: status as ContractorStatus,
      password,
    },
  };
}

export function sanitizePageUrl(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback.slice(0, 1000);
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback.slice(0, 1000);
    return url.toString().slice(0, 1000);
  } catch {
    return fallback.slice(0, 1000);
  }
}
