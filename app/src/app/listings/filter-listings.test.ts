// Filtrene og de grå opsjonene (#102, #122). Rene funksjoner, så testene trenger ingen database.
// Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import type { Listing } from "@/db/schema";
import { availableOptions, matchesFilters } from "./filter-listings";
import type { ListingFilters } from "./search-params";

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: "x",
    ownerId: "owner",
    type: "sale",
    title: "Ting",
    description: "",
    category: "electronics",
    condition: "used",
    price: 100,
    status: "active",
    createdAt: new Date("2026-10-01"),
    updatedAt: new Date("2026-10-01"),
    ...overrides,
  };
}

const NONE: ListingFilters = { type: [], condition: [] };

const listings = [
  listing({ id: "book-sale", category: "books", type: "sale", condition: "new", price: 300 }),
  listing({ id: "book-loan", category: "books", type: "loan", condition: "used", price: null }),
  listing({ id: "bike-sale", category: "bikes", type: "sale", condition: "used", price: 1500 }),
  listing({ id: "book-gift", category: "books", type: "giveaway", condition: "like_new", price: null }),
];

const ids = (filters: Partial<ListingFilters>) =>
  listings
    .filter((l) => matchesFilters(l, { ...NONE, ...filters }))
    .map((l) => l.id)
    .sort();

describe("matchesFilters", () => {
  it("uten filtre passer alt", () => {
    expect(ids({})).toHaveLength(4);
  });

  it("filtrerer på kategori", () => {
    expect(ids({ category: "books" })).toEqual(["book-gift", "book-loan", "book-sale"]);
  });

  it("flere handelstyper eller tilstander gir annonser som har en av dem", () => {
    expect(ids({ type: ["loan", "giveaway"] })).toEqual(["book-gift", "book-loan"]);
    expect(ids({ condition: ["new", "like_new"] })).toEqual(["book-gift", "book-sale"]);
  });

  it("pris fra og til tar med grensene, og tom pris regnes som 0 kr", () => {
    expect(ids({ minPrice: 300, maxPrice: 1500 })).toEqual(["bike-sale", "book-sale"]);
    expect(ids({ maxPrice: 0 })).toEqual(["book-gift", "book-loan"]);
  });

  it("filtrene kombineres", () => {
    expect(ids({ category: "books", type: ["sale", "loan"], condition: ["used"] })).toEqual(["book-loan"]);
  });
});

describe("availableOptions", () => {
  it("uten filtre er bare verdiene som finnes tilgjengelige", () => {
    const options = availableOptions(listings, NONE);

    expect(options.category.sort()).toEqual(["bikes", "books"]);
    expect(options.condition.sort()).toEqual(["like_new", "new", "used"]);
  });

  it("valg i én gruppe gjør opsjoner i de andre gruppene grå (Max sitt eksempel: ingen nye sykler)", () => {
    const options = availableOptions(listings, { ...NONE, category: "bikes" });

    expect(options.condition).toEqual(["used"]);
    expect(options.type).toEqual(["sale"]);
  });

  it("egen gruppe holdes utenfor, så de andre handelstypene ikke blir grå av et valg i Handelstype", () => {
    const options = availableOptions(listings, { ...NONE, type: ["loan"] });

    expect(options.type.sort()).toEqual(["giveaway", "loan", "sale"]);
    expect(options.category).toEqual(["books"]);
  });

  it("prisen begrenser alle gruppene", () => {
    const options = availableOptions(listings, { ...NONE, minPrice: 1000 });

    expect(options.category).toEqual(["bikes"]);
  });
});
