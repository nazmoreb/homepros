import {
  choiceLabel,
  getCategoryById,
  homeownerStatuses,
  timelines,
} from "@/lib/categories";

export function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function formatPhone(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (clean.length !== 10) return digits;
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
}

export function formatWhen(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return (
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

export function leadStatusLabel(status: string): string {
  switch (status) {
    case "ASSIGNED":
      return "Assigned";
    case "UNMATCHED":
      return "Unmatched";
    case "RETURNED":
      return "Returned";
    case "INVALID":
      return "Invalid";
    case "SENT":
      return "Sent";
    default:
      return status;
  }
}

export function contractorStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "VETTED":
      return "Vetted";
    case "APPROVED":
      return "Approved";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status;
  }
}

export function categoryLabel(categoryId: string): string {
  return getCategoryById(categoryId)?.label ?? categoryId;
}

export function timelineLabel(value: string): string {
  return choiceLabel(timelines, value);
}

export function homeownerLabel(value: string): string {
  return choiceLabel(homeownerStatuses, value);
}

export function homeownerThankYou(value: string): string {
  switch (value) {
    case "owner_occupied":
      return "You own the home and live there.";
    case "owner_rental":
      return "You own the home and rent it out.";
    case "renter":
      return "You rent the home.";
    case "authorized":
      return "You are authorized to request this work.";
    default:
      return homeownerLabel(value);
  }
}

export function formatProjectDetails(
  categoryId: string,
  details: unknown,
): { label: string; value: string }[] {
  const category = getCategoryById(categoryId);
  if (!category || !details || typeof details !== "object" || Array.isArray(details)) return [];
  const record = details as Record<string, unknown>;
  return category.fields.map((field) => {
    const raw = record[field.name];
    return {
      label: field.label.replace(/\?$/, ""),
      value: choiceLabel(field.options, typeof raw === "string" ? raw : ""),
    };
  });
}

export function personName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}
