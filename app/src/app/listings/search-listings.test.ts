// Fuzzy søk i tittel, beskrivelse og selgerens navn. Ren funksjon, så ingen database trengs.
// Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import type { Listing } from "@/db/schema";
import type { ListingWithOwner } from "./queries";
import { searchListings } from "./search-listings";

function row(id: string, title: string, description: string, ownerName: string): ListingWithOwner {
  const listing: Listing = {
    id,
    ownerId: `owner-${id}`,
    type: "sale",
    title,
    description,
    category: "other",
    condition: "used",
    price: 100,
    status: "active",
    createdAt: new Date("2026-10-10"),
    updatedAt: new Date("2026-10-10"),
  };
  return { listing, ownerName };
}

const rows = [
  row("calc", "Kalkulator", "Casio fx-991, lite brukt.", "Kari Nordmann"),
  row("glass", "Øl-glass, seks stk", "Fra Hansa.", "Ola Hansen"),
  row("tent", "Telt for to", "Lett telt, brukt to turer.", "Per Pettersen"),
  row("book", "Lærebok i matematikk", "Kalkulus 1, med notater i margen.", "Siri Lund"),
  row("bike", "Sykkel", "Grå bysykkel med kurv.", "Emil Berg"),
  row(
    "bag",
    "Ryggsekk",
    "God sekk på 40 liter med regntrekk, mange lommer og hoftebelte. Følger med en primus.",
    "Nora Dahl",
  ),
];

function ids(q: string) {
  return searchListings(rows, q).map((r) => r.listing.id);
}

describe("searchListings", () => {
  it("finner annonsen ved skrivefeil, delord og store bokstaver", () => {
    for (const q of ["kalkulater", "kalk", "KALKULATOR"]) {
      expect(ids(q)[0]).toBe("calc");
    }
  });

  it("skiller ikke på store og små æøå", () => {
    expect(ids("øl")).toContain("glass");
    expect(ids("ØL")).toContain("glass");
  });

  it("finner annonser på selgerens navn", () => {
    expect(ids("kari")).toEqual(["calc"]);
  });

  it("lar ikke korte søkeord treffe navn med én bokstav forskjell", () => {
    const withTest = [...rows, row("drill", "Drill", "Bosch.", "Test Testesen")];
    const result = searchListings(withTest, "telt").map((r) => r.listing.id);
    expect(result).toEqual(["tent"]);
  });

  it("finner ord langt ute i beskrivelsen", () => {
    expect(ids("primus")).toEqual(["bag"]);
  });

  it("gir ingen treff på ord som ikke ligner", () => {
    expect(ids("mikroskop")).toEqual([]);
  });

  it("rangerer et treff i tittelen over et like godt treff i beskrivelsen", () => {
    // Samme tekst i begge feltene, så bare vektingen av tittelen kan avgjøre rekkefølgen.
    const pair = [
      row("in-description", "Møbelsett", "Lampe og bord", "Ola Hansen"),
      row("in-title", "Lampe og bord", "Brukt i ett år.", "Ola Hansen"),
    ];
    const result = searchListings(pair, "lampe").map((r) => r.listing.id);
    expect(result).toEqual(["in-title", "in-description"]);
  });

  it("uten søkeord kommer alle annonsene i samme rekkefølge", () => {
    expect(searchListings(rows, "")).toEqual(rows);
  });
});
