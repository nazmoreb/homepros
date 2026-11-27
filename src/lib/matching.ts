export const MAX_MATCHES_PER_LEAD = 3;

export type MatchCandidate = {
  id: string;
  businessName: string;
  status: string;
  categories: string[];
  serviceZips: string[];
  monthlyLeadCap: number | null;
  leadsThisMonth: number;
};

export type MatchInput = {
  zip: string;
  category: string;
};

/**
 * Approved contractors who cover the ZIP and category, under their monthly cap.
 * Fewest leads this month first, then business name. Never more than `limit`.
 */
export function matchContractors(
  input: MatchInput,
  candidates: MatchCandidate[],
  options?: { limit?: number },
): MatchCandidate[] {
  const limit = options?.limit ?? MAX_MATCHES_PER_LEAD;
  const zip = input.zip.trim();
  const category = input.category.trim().toUpperCase();

  if (!zip || !category || limit <= 0) return [];

  return candidates
    .filter((candidate) => candidate.status.toUpperCase() === "APPROVED")
    .filter((candidate) =>
      candidate.categories.some((item) => item.toUpperCase() === category),
    )
    .filter((candidate) => candidate.serviceZips.includes(zip))
    .filter(
      (candidate) =>
        candidate.monthlyLeadCap === null ||
        candidate.leadsThisMonth < candidate.monthlyLeadCap,
    )
    .sort((a, b) => {
      if (a.leadsThisMonth !== b.leadsThisMonth) {
        return a.leadsThisMonth - b.leadsThisMonth;
      }
      return a.businessName.localeCompare(b.businessName);
    })
    .slice(0, limit);
}

export function monthStartUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
