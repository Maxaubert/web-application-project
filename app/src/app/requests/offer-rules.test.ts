// Bud og perioder valideres etter annonsens handelstype. Feilene er på norsk og knyttet til feltet.
import { describe, expect, it } from "vitest";
import { loanPrice } from "@/app/shared/loanPrice";
import { loanDays, validateOffer } from "./offer-rules";

function errorsFor(type: "sale" | "loan" | "giveaway", values: Parameters<typeof validateOffer>[1]) {
  const result = validateOffer(type, values);
  if (result.success) throw new Error("Ventet avvisning");
  return result.fieldErrors;
}

describe("bud på salg", () => {
  it("godtar et helt beløp og lagrer ingen datoer", () => {
    expect(validateOffer("sale", { price: "250" })).toEqual({
      success: true,
      data: { price: 250, startDate: null, endDate: null },
    });
  });

  it("godtar 0 og 100 000 kr", () => {
    expect(validateOffer("sale", { price: "0" }).success).toBe(true);
    expect(validateOffer("sale", { price: "100000" }).success).toBe(true);
  });

  it("avviser tomt, negativt, desimal og for høyt bud", () => {
    expect(errorsFor("sale", { price: "" }).price).toBe("Skriv et bud");
    expect(errorsFor("sale", {}).price).toBe("Skriv et bud");
    expect(errorsFor("sale", { price: "-1" }).price).toContain("helt tall");
    expect(errorsFor("sale", { price: "12.5" }).price).toContain("helt tall");
    expect(errorsFor("sale", { price: "100001" }).price).toBe("Bud kan være høyst 100 000 kr");
  });

  it("avviser datoer", () => {
    expect(errorsFor("sale", { price: "250", startDate: "2026-11-01" }).startDate).toBeDefined();
    expect(errorsFor("sale", { price: "250", endDate: "2026-11-08" }).endDate).toBeDefined();
  });
});

describe("periode for lån", () => {
  it("godtar en uke, og lagrer ingen pris", () => {
    expect(validateOffer("loan", { startDate: "2026-11-01", endDate: "2026-11-07" })).toEqual({
      success: true,
      data: { price: null, startDate: "2026-11-01", endDate: "2026-11-07" },
    });
  });

  it("avviser en periode på seks dager, men ikke sju", () => {
    expect(errorsFor("loan", { startDate: "2026-11-01", endDate: "2026-11-06" }).endDate).toBe(
      "Lånet må vare minst én uke",
    );
    expect(validateOffer("loan", { startDate: "2026-11-01", endDate: "2026-11-07" }).success).toBe(true);
  });

  it("avviser til-dato før fra-dato", () => {
    expect(errorsFor("loan", { startDate: "2026-11-10", endDate: "2026-11-01" }).endDate).toBe(
      "Til-dato kan ikke være før fra-dato",
    );
    expect(errorsFor("loan", { startDate: "2026-11-10", endDate: "2026-11-09" }).endDate).toBe(
      "Til-dato kan ikke være før fra-dato",
    );
  });

  it("avviser manglende og ugyldige datoer uten å krasje", () => {
    expect(errorsFor("loan", {})).toEqual({ startDate: "Velg fra-dato", endDate: "Velg til-dato" });
    expect(errorsFor("loan", { startDate: "2026-02-31", endDate: "2026-03-10" }).startDate).toContain("ÅÅÅÅ-MM-DD");
    expect(errorsFor("loan", { startDate: "01.11.2026", endDate: "2026-11-10" }).startDate).toContain("ÅÅÅÅ-MM-DD");
    expect(errorsFor("loan", { startDate: "12026-11-01", endDate: "2026-11-10" }).startDate).toContain("ÅÅÅÅ-MM-DD");
  });

  it("godtar en lang periode, siden kravene bare har en nedre grense", () => {
    expect(validateOffer("loan", { startDate: "2026-11-01", endDate: "2028-01-01" }).success).toBe(true);
  });

  it("avviser pris", () => {
    expect(errorsFor("loan", { price: "100", startDate: "2026-11-01", endDate: "2026-11-07" }).price).toBeDefined();
  });

  it("teller begge dagene, og over månedsskifte og skuddår", () => {
    expect(loanDays("2026-11-01", "2026-11-07")).toBe(7);
    expect(loanDays("2026-11-01", "2026-11-01")).toBe(1);
    expect(loanDays("2028-02-27", "2028-03-02")).toBe(5);
  });

  it("gir lånepris sammen med loanPrice: 14 dager à 70 kr i uka er 140 kr", () => {
    expect(loanPrice(70, loanDays("2026-11-01", "2026-11-14"))).toBe(140);
  });
});

describe("forespørsel om å få gratis", () => {
  it("godtar uten vilkår", () => {
    expect(validateOffer("giveaway", {})).toEqual({
      success: true,
      data: { price: null, startDate: null, endDate: null },
    });
    expect(validateOffer("giveaway", { price: "", startDate: "", endDate: "" }).success).toBe(true);
  });

  it("avviser bud og datoer", () => {
    expect(errorsFor("giveaway", { price: "10" }).price).toBeDefined();
    expect(errorsFor("giveaway", { startDate: "2026-11-01", endDate: "2026-11-08" })).toHaveProperty("startDate");
  });
});
