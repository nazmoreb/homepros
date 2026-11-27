export function formatLegalNames(names: string[]): string {
  const clean = names.map((name) => name.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0]!;
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

export function buildConsentText(names: string[], categoryLabel: string): string {
  const who = formatLegalNames(names);
  return `I agree that ${who} may contact me by phone, text message, or email about my ${categoryLabel} project, including using an automatic telephone dialing system or a prerecorded voice. I am giving this consent to each named business separately, one to one, and not to a shared partner list. HomePros may share the details I submitted with only these businesses. Consent is not a condition of any purchase. Message and data rates may apply. I can ask a business to stop contacting me.`;
}

export function buildNoMatchConsentText(zip: string, categoryLabel: string): string {
  return `No contractor on HomePros covers ${categoryLabel} in ZIP ${zip} right now. I understand HomePros will save this request, will not share it with a contractor, and will not invent a match outside this area. I agree that HomePros may store my contact details with this request.`;
}
