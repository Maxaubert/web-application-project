// Linjen med type og pris på annonsekortet skal følge wireframen WF-03. Godkjent av Max 07.10.
import { describe, expect, it } from "vitest";
import { formatTypeAndPrice } from "./format-type-and-price";

describe("formatTypeAndPrice", () => {
  it("viser salg med pris", () => {
    expect(formatTypeAndPrice({ type: "sale", price: 350 })).toBe("Salg · 350 kr");
  });

  it("skriver store priser med norsk tusenskille", () => {
    expect(formatTypeAndPrice({ type: "sale", price: 1500 })).toBe("Salg · 1 500 kr");
  });

  it("viser lån med ukepris", () => {
    expect(formatTypeAndPrice({ type: "loan", price: 40 })).toBe("Lån · 40 kr/uke");
  });

  it("viser lån uten pris og med pris 0 som gratis", () => {
    expect(formatTypeAndPrice({ type: "loan", price: null })).toBe("Lån · gratis");
    expect(formatTypeAndPrice({ type: "loan", price: 0 })).toBe("Lån · gratis");
  });

  it("viser bare Gis bort, også om en pris er lagret", () => {
    expect(formatTypeAndPrice({ type: "giveaway", price: null })).toBe("Gis bort");
    expect(formatTypeAndPrice({ type: "giveaway", price: 100 })).toBe("Gis bort");
  });

  it("sier ærlig fra når et salg mangler pris", () => {
    expect(formatTypeAndPrice({ type: "sale", price: null })).toBe("Salg · pris mangler");
  });
});
