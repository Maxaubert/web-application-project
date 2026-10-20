// overlaps (TK-06, #186): begge endedagene teller med, så perioder som deler én dag overlapper.
import { describe, expect, it } from "vitest";
import { overlaps } from "./occupied";

const taken = { startDate: "2026-11-10", endDate: "2026-11-17" };

describe("overlaps", () => {
  it.each([
    ["ligger midt i", "2026-11-12", "2026-11-14"],
    ["omslutter", "2026-11-01", "2026-11-30"],
    ["starter før og slutter inni", "2026-11-03", "2026-11-10"],
    ["starter inni og slutter etter", "2026-11-17", "2026-11-24"],
  ])("en periode som %s den opptatte, overlapper", (_name, startDate, endDate) => {
    expect(overlaps(taken, { startDate, endDate })).toBe(true);
    expect(overlaps({ startDate, endDate }, taken)).toBe(true);
  });

  it.each([
    ["slutter dagen før", "2026-11-03", "2026-11-09"],
    ["starter dagen etter", "2026-11-18", "2026-11-25"],
  ])("en periode som %s den opptatte, overlapper ikke", (_name, startDate, endDate) => {
    expect(overlaps(taken, { startDate, endDate })).toBe(false);
    expect(overlaps({ startDate, endDate }, taken)).toBe(false);
  });
});
