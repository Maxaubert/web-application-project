// Validering av «Legg ut annonse» (FK-03, #131). Godkjent av Max 11.10.
import { describe, expect, it } from "vitest";
import { validateListing, type ListingFormValues } from "./listing-schema";

function form(overrides: Partial<ListingFormValues> = {}): ListingFormValues {
  return {
    title: "Skjerm 24 tommer",
    description: "HDMI-kabel følger med.",
    category: "electronics",
    type: "sale",
    condition: "used",
    price: "250",
    ...overrides,
  };
}

function errors(overrides: Partial<ListingFormValues>) {
  const result = validateListing(form(overrides));
  return result.success ? {} : result.fieldErrors;
}

describe("validateListing", () => {
  it("gir riktig pris for hver handelstype: salg som tall, tomt lån er gratis, gis bort har aldri pris", () => {
    expect(validateListing(form({ type: "sale", price: "250" }))).toMatchObject({ success: true, data: { price: 250 } });
    expect(validateListing(form({ type: "sale", price: "0" }))).toMatchObject({ success: true, data: { price: 0 } });
    expect(validateListing(form({ type: "loan", price: "" }))).toMatchObject({ success: true, data: { price: null } });
    expect(validateListing(form({ type: "loan", price: "100" }))).toMatchObject({ success: true, data: { price: 100 } });
    expect(validateListing(form({ type: "giveaway", price: "999" }))).toMatchObject({ success: true, data: { price: null } });
  });

  it("fjerner mellomrom rundt tittel og beskrivelse", () => {
    expect(validateListing(form({ title: "  Skjerm  ", description: " Lite brukt. " }))).toMatchObject({
      success: true,
      data: { title: "Skjerm", description: "Lite brukt." },
    });
  });

  it("tittelen må ha 3 til 80 tegn", () => {
    expect(errors({ title: "" }).title).toBe("Skriv en tittel");
    expect(errors({ title: "ab" }).title).toBe("Tittelen må ha minst 3 tegn");
    expect(errors({ title: "a".repeat(81) }).title).toBe("Tittelen kan ha høyst 80 tegn");
    expect(validateListing(form({ title: "abc" })).success).toBe(true);
    expect(validateListing(form({ title: "a".repeat(80) })).success).toBe(true);
  });

  it("beskrivelse er påkrevd og høyst 2000 tegn", () => {
    expect(errors({ description: "   " }).description).toBe("Beskriv varen");
    expect(errors({ description: "a".repeat(2001) }).description).toBe("Beskrivelsen kan ha høyst 2000 tegn");
    expect(validateListing(form({ description: "a".repeat(2000) })).success).toBe(true);
  });

  it("avviser ukjent kategori, handelstype og tilstand", () => {
    expect(errors({ category: "cars" }).category).toBe("Velg en kategori");
    expect(errors({ type: "rent" }).type).toBe("Velg handelstype");
    expect(errors({ condition: "broken" }).condition).toBe("Velg tilstand");
  });

  it("salgspris må finnes og være et helt tall fra 0 til 100 000", () => {
    expect(errors({ price: "" }).price).toBe("Skriv en pris");
    for (const price of ["-5", "2.5", "250,-", "abc"]) {
      expect(errors({ price }).price, price).toBe("Pris må være et helt tall, for eksempel 250");
    }
    expect(errors({ price: "100001" }).price).toBe("Pris kan være høyst 100 000 kr");
    expect(validateListing(form({ price: "100000" })).success).toBe(true);
  });

  it("viser alle feilene samtidig, også prisen når andre felt er feil", () => {
    expect(Object.keys(errors({ title: "", price: "250,-" })).sort()).toEqual(["price", "title"]);
  });
});
