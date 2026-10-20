// Dager og pris for en låneperiode (#186): ukepris / 7 per dag, avrundet opp til hele kroner. Godkjent av Max 20.10.
import { describe, expect, it } from "vitest";
import { formatLoanPrice, loanSummary } from "./loan-summary";

describe("loanSummary", () => {
  it("teller begge dagene: 12.11 til 18.11 er 7 dager, og en uke koster ukeprisen", () => {
    expect(loanSummary("2026-11-12", "2026-11-18", 60)).toEqual({ days: 7, price: 60 });
  });

  it("runder opp til hele kroner: 8 dager à 60 kr/uke er 68,57 og blir 69", () => {
    expect(loanSummary("2026-11-12", "2026-11-19", 60)).toEqual({ days: 8, price: 69 });
  });

  it("runder alltid opp, også når brøken er under en halv: 9 dager à 60 kr/uke er 77,14 og blir 78", () => {
    expect(loanSummary("2026-11-12", "2026-11-20", 60)).toEqual({ days: 9, price: 78 });
  });

  it("et lån uten ukepris er gratis", () => {
    expect(loanSummary("2026-11-12", "2026-11-19", null)).toEqual({ days: 8, price: 0 });
  });

  it("gir null mens perioden er ufullstendig eller ugyldig", () => {
    expect(loanSummary("", "", 60)).toBeNull();
    expect(loanSummary("2026-11-12", "", 60)).toBeNull();
    expect(loanSummary("2026-02-31", "2026-03-10", 60)).toBeNull();
    expect(loanSummary("2026-11-19", "2026-11-12", 60)).toBeNull();
  });

  it("en periode på én dag gir 1 dag (serveren avviser den, men summen kan regnes)", () => {
    expect(loanSummary("2026-11-12", "2026-11-12", 70)).toEqual({ days: 1, price: 10 });
  });
});

describe("formatLoanPrice", () => {
  it("skriver «Gratis» for 0 og ellers kroner", () => {
    expect(formatLoanPrice(0)).toBe("Gratis");
    expect(formatLoanPrice(69)).toBe("69 kr");
  });
});
