// Filtrene på forsiden (#102, #122): én ren funksjon avgjør om en annonse passer, og den samme brukes
// både til annonselisten og til å finne opsjonene som fortsatt gir treff. Kjøres på serveren etter søket,
// så det grå i filtrene alltid stemmer med søkeordet.
import type { Listing } from "@/db/schema";
import type { ListingFilters } from "./search-params";

type Group = "category" | "type" | "condition";

export type AvailableOptions = { [G in Group]: Listing[G][] };

// Tom pris betyr gratis (lån) eller ingen pris (gis bort), så den regnes som 0 kr.
export function matchesFilters(listing: Listing, filters: ListingFilters, ignore?: Group) {
  const price = listing.price ?? 0;
  return (
    (ignore === "category" || !filters.category || listing.category === filters.category) &&
    (ignore === "type" || filters.type.length === 0 || filters.type.includes(listing.type)) &&
    (ignore === "condition" || filters.condition.length === 0 || filters.condition.includes(listing.condition)) &&
    (filters.minPrice === undefined || price >= filters.minPrice) &&
    (filters.maxPrice === undefined || price <= filters.maxPrice)
  );
}

// En opsjon er tilgjengelig hvis minst én annonse har den og passer alle de andre gruppene. Egen gruppe
// holdes utenfor, ellers ville et valg i Handelstype gjort de andre handelstypene grå.
export function availableOptions(listings: Listing[], filters: ListingFilters): AvailableOptions {
  const valuesIn = <G extends Group>(group: G) => [
    ...new Set(listings.filter((l) => matchesFilters(l, filters, group)).map((l) => l[group])),
  ];
  return { category: valuesIn("category"), type: valuesIn("type"), condition: valuesIn("condition") };
}
