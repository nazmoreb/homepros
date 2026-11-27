import { describe, expect, it } from "vitest";
import { matchContractors, type MatchCandidate } from "@/lib/matching";

function candidate(overrides: Partial<MatchCandidate> & Pick<MatchCandidate, "id" | "businessName">): MatchCandidate {
  return {
    status: "APPROVED",
    categories: ["ROOFING"],
    serviceZips: ["78704"],
    monthlyLeadCap: null,
    leadsThisMonth: 0,
    ...overrides,
  };
}

const pool: MatchCandidate[] = [
  candidate({ id: "1", businessName: "Hill Country Roofing", leadsThisMonth: 2 }),
  candidate({ id: "2", businessName: "Live Oak Metal Roofs", leadsThisMonth: 0, monthlyLeadCap: 4 }),
  candidate({ id: "3", businessName: "South Congress Roof Co", leadsThisMonth: 0 }),
  candidate({ id: "4", businessName: "Pending Roof Co", status: "PENDING" }),
  candidate({ id: "5", businessName: "Vetted Air", status: "VETTED", categories: ["HVAC"] }),
  candidate({ id: "6", businessName: "Suspended Siding", status: "SUSPENDED", categories: ["SIDING"] }),
  candidate({ id: "7", businessName: "Denver Windows", categories: ["WINDOWS"], serviceZips: ["80205"] }),
  candidate({ id: "8", businessName: "Capped Roofer", monthlyLeadCap: 2, leadsThisMonth: 2 }),
  candidate({ id: "9", businessName: "Zero Cap Roofer", monthlyLeadCap: 0, leadsThisMonth: 0 }),
  candidate({ id: "10", businessName: "Austin HVAC", categories: ["HVAC"], serviceZips: ["78704", "78746"] }),
];

describe("matchContractors", () => {
  it("returns approved pros for the ZIP and category, fewest leads first", () => {
    const matches = matchContractors({ zip: "78704", category: "ROOFING" }, pool);
    expect(matches.map((match) => match.businessName)).toEqual([
      "Live Oak Metal Roofs",
      "South Congress Roof Co",
      "Hill Country Roofing",
    ]);
  });

  it("never returns more than three", () => {
    const extra = [
      ...pool,
      candidate({ id: "11", businessName: "Fourth Roofer", leadsThisMonth: 1 }),
      candidate({ id: "12", businessName: "Fifth Roofer", leadsThisMonth: 1 }),
    ];
    expect(matchContractors({ zip: "78704", category: "roofing" }, extra)).toHaveLength(3);
  });

  it("skips pros at or over a monthly cap, including a cap of zero", () => {
    const names = matchContractors({ zip: "78704", category: "ROOFING" }, pool).map((match) => match.id);
    expect(names).not.toContain("8");
    expect(names).not.toContain("9");
  });

  it("includes a pro who is still under the cap", () => {
    const matches = matchContractors(
      { zip: "78704", category: "ROOFING" },
      [candidate({ id: "under", businessName: "Under Cap", monthlyLeadCap: 3, leadsThisMonth: 2 })],
    );
    expect(matches).toHaveLength(1);
  });

  it("ignores pending, vetted, and suspended pros", () => {
    const matches = matchContractors({ zip: "78704", category: "HVAC" }, pool);
    expect(matches.map((match) => match.businessName)).toEqual(["Austin HVAC"]);
  });

  it("returns an empty list when the ZIP or trade is not covered", () => {
    expect(matchContractors({ zip: "99501", category: "FLOORING" }, pool)).toEqual([]);
    expect(matchContractors({ zip: "80205", category: "ROOFING" }, pool)).toEqual([]);
  });

  it("matches a ZIP only when it is listed exactly", () => {
    expect(matchContractors({ zip: "7870", category: "ROOFING" }, pool)).toEqual([]);
    expect(matchContractors({ zip: "78746", category: "HVAC" }, pool)).toHaveLength(1);
  });

  it("honors a lower limit and a non-positive limit", () => {
    expect(matchContractors({ zip: "78704", category: "ROOFING" }, pool, { limit: 1 })).toHaveLength(1);
    expect(matchContractors({ zip: "78704", category: "ROOFING" }, pool, { limit: 0 })).toEqual([]);
  });
});
