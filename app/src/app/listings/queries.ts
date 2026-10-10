// Databasespørringer for annonser. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { listing, user, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import type { ListingFilters } from "./search-params";

export type ListingWithOwner = { listing: Listing; ownerName: string };

// Tom pris betyr gratis (lån) eller ingen pris (gis bort), så den regnes som 0 kr i prisfilteret.
const priceOrZero = sql<number>`coalesce(${listing.price}, 0)`;

// Aktive annonser til forsiden, nyeste først (WF-03). Solgte og nedtatte vises ikke.
// Eierens navn følger med, så søket kan finne annonser på selgerens navn (#97).
// Filtrene kjøres i SQL (#102); and() hopper over undefined, så et filter som ikke er satt, gir ingen betingelse.
export function getActiveListings(db: Db, filters: Partial<ListingFilters> = {}): Promise<ListingWithOwner[]> {
  const { category, type = [], condition = [], minPrice, maxPrice } = filters;
  return db
    .select({ listing, ownerName: user.name })
    .from(listing)
    .innerJoin(user, eq(listing.ownerId, user.id))
    .where(
      and(
        eq(listing.status, "active"),
        category ? eq(listing.category, category) : undefined,
        type.length > 0 ? inArray(listing.type, type) : undefined,
        condition.length > 0 ? inArray(listing.condition, condition) : undefined,
        minPrice !== undefined ? gte(priceOrZero, minPrice) : undefined,
        maxPrice !== undefined ? lte(priceOrZero, maxPrice) : undefined,
      ),
    )
    .orderBy(desc(listing.createdAt));
}

// Én annonse med eierens navn til annonsesiden (WF-04), uansett status; siden avgjør hva som vises.
// Bare navnet hentes fra brukeren, så telefon og e-post aldri kan havne på siden.
export async function getListingWithOwner(db: Db, id: string): Promise<ListingWithOwner | undefined> {
  const rows = await db
    .select({ listing, ownerName: user.name })
    .from(listing)
    .innerJoin(user, eq(listing.ownerId, user.id))
    .where(eq(listing.id, id))
    .limit(1);
  return rows[0];
}
