import { describe, expect, it } from "vitest";
import { buildConsentText, buildNoMatchConsentText, formatLegalNames } from "@/lib/consent";

describe("consent text", () => {
  it("names one, two, and three businesses in a stable way", () => {
    expect(formatLegalNames(["Hill Country Roofing"])).toBe("Hill Country Roofing");
    expect(formatLegalNames(["Live Oak Metal Roofs", "Hill Country Roofing"])).toBe(
      "Live Oak Metal Roofs and Hill Country Roofing",
    );
    expect(formatLegalNames(["A Roofing", "B Roofing", "C Roofing"])).toBe(
      "A Roofing, B Roofing, and C Roofing",
    );
  });

  it("builds a one-to-one statement that includes every name", () => {
    const text = buildConsentText(["Live Oak Metal Roofs", "South Congress Roof Co", "Hill Country Roofing"], "Roofing");
    expect(text).toContain("Live Oak Metal Roofs, South Congress Roof Co, and Hill Country Roofing");
    expect(text).toContain("one to one");
    expect(text).toContain("Roofing");
    expect(text).toContain("not to a shared partner list");
  });

  it("says plainly when nobody matched", () => {
    const text = buildNoMatchConsentText("99501", "Flooring");
    expect(text).toContain("99501");
    expect(text).toContain("Flooring");
    expect(text).toContain("will not share it with a contractor");
  });
});
