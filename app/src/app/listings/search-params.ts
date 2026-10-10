// Leser søk og filtre fra adressen på forsiden (?q=&category=&type=&condition=&minPrice=&maxPrice=).
// URL-en kan skrives av hvem som helst, så den valideres på serveren selv om skjemaet bare kan sende
// gyldige verdier (#97, #102).
import { z } from "zod";
import { listingCategories, listingConditions, listingTypes } from "@/db/schema";
import { PRICE_MAX, SEARCH_MAX_LENGTH } from "./search-limits";

// Tomme felt («Alle», tom pris) sendes som tom streng og betyr «ikke filtrer».
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const price = z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(PRICE_MAX).optional());

// Feltene alene, så API-et kan utvide dem med limit (Zod lar ikke et skjema med refine utvides).
export const searchFields = z.object({
  q: z.string().trim().max(SEARCH_MAX_LENGTH).default(""),
  category: z.preprocess(emptyToUndefined, z.enum(listingCategories).optional()),
  // Avkrysning: flere valg, ingen avkrysset betyr alle.
  type: z.array(z.enum(listingTypes)).default([]),
  condition: z.array(z.enum(listingConditions)).default([]),
  minPrice: price,
  maxPrice: price,
});

// «Fra» over «Til» kan ikke gi treff, så det regnes som ugyldig søk.
export const pricesInOrder = (s: { minPrice?: number; maxPrice?: number }) =>
  s.minPrice === undefined || s.maxPrice === undefined || s.minPrice <= s.maxPrice;

export const searchSchema = searchFields.refine(pricesInOrder);

export type Search = z.infer<typeof searchSchema>;
export type ListingFilters = Omit<Search, "q">;

// URLSearchParams har én verdi per nøkkel med get(), men avkrysningene kan stå flere ganger (?type=sale&type=loan).
export function searchInput(url: URL) {
  const params = url.searchParams;
  const one = (key: string) => params.get(key) ?? undefined;
  return {
    q: one("q"),
    category: one("category"),
    type: params.getAll("type"),
    condition: params.getAll("condition"),
    minPrice: one("minPrice"),
    maxPrice: one("maxPrice"),
  };
}

export function parseSearch(url: URL) {
  return searchSchema.safeParse(searchInput(url));
}

// Antall filtre som er på, til merket på «Filtre»-knappen på mobil.
export function countActiveFilters(f: ListingFilters) {
  const priceSet = f.minPrice !== undefined || f.maxPrice !== undefined;
  return (f.category ? 1 : 0) + f.type.length + f.condition.length + (priceSet ? 1 : 0);
}
