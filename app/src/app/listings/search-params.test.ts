// Søket leses fra adressen og valideres på serveren. Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { countActiveFilters, parseSearch } from "./search-params";

function search(query: string) {
  return parseSearch(new URL(`http://localhost/${query}`));
}

describe("parseSearch", () => {
  it("leser søkeordet og fjerner mellomrom rundt det, og tom adresse betyr tomt søk", () => {
    expect(search("?q=%20kalk%20")).toMatchObject({ success: true, data: { q: "kalk" } });
    expect(search("")).toMatchObject({ success: true, data: { q: "" } });
  });

  it("avviser søk over 100 tegn, men godtar akkurat 100", () => {
    expect(search(`?q=${"a".repeat(101)}`).success).toBe(false);
    expect(search(`?q=${"a".repeat(100)}`).success).toBe(true);
  });
});

// Filtrene (#102). Godkjent av Max 10.10.
describe("parseSearch med filtre", () => {
  it("leser kategori, flere handelstyper og tilstander, og pris som tall", () => {
    expect(search("?category=books&type=sale&type=loan&condition=new&minPrice=10&maxPrice=200")).toMatchObject({
      success: true,
      data: { category: "books", type: ["sale", "loan"], condition: ["new"], minPrice: 10, maxPrice: 200 },
    });
  });

  it("tomme felt fra skjemaet betyr ingen filtre", () => {
    expect(search("?q=&category=&minPrice=&maxPrice=")).toEqual({
      success: true,
      data: { q: "", category: undefined, type: [], condition: [], minPrice: undefined, maxPrice: undefined },
    });
  });

  it("avviser ukjente verdier, negativ eller brøkpris og «fra» over «til»", () => {
    const invalid = ["?category=bogus", "?type=rent", "?condition=broken", "?minPrice=-1", "?maxPrice=2.5", "?minPrice=abc", "?minPrice=300&maxPrice=100"];
    for (const query of invalid) {
      expect(search(query).success, query).toBe(false);
    }
    expect(search("?minPrice=100&maxPrice=100").success).toBe(true);
  });
});

describe("countActiveFilters", () => {
  it("teller kategori, hver avkrysning og prisen som ett filter", () => {
    expect(countActiveFilters({ type: [], condition: [] })).toBe(0);
    expect(countActiveFilters({ category: "books", type: ["sale", "loan"], condition: ["new"], minPrice: 0 })).toBe(5);
    expect(countActiveFilters({ type: [], condition: [], minPrice: 10, maxPrice: 20 })).toBe(1);
  });
});
