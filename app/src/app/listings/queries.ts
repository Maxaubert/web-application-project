// Databasespørringer for annonser. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, asc, desc, eq } from "drizzle-orm";
import { listing, listingImage, user, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";

// coverKey: forsidebildets nøkkel i R2 (posisjon 0), eller null for annonser uten bilde (#150).
export type ListingWithOwner = { listing: Listing; ownerName: string; coverKey: string | null };

// Aktive annonser til forsiden, nyeste først (WF-03). Solgte og nedtatte vises ikke.
// Eierens navn følger med, så søket kan finne annonser på selgerens navn (#97).
// Filtrene kjøres etter søket i filter-listings.ts (#122), så de grå opsjonene stemmer med søkeordet.
// Forsidebildet hentes i samme spørring med en left join, så annonser uten bilde også kommer med (#150).
export function getActiveListings(db: Db): Promise<ListingWithOwner[]> {
  return db
    .select({ listing, ownerName: user.name, coverKey: listingImage.key })
    .from(listing)
    .innerJoin(user, eq(listing.ownerId, user.id))
    .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
    .where(eq(listing.status, "active"))
    .orderBy(desc(listing.createdAt));
}

// Én annonse med eierens navn til annonsesiden (WF-04), uansett status; siden avgjør hva som vises.
// Bare navnet hentes fra brukeren, så telefon og e-post aldri kan havne på siden.
export async function getListingWithOwner(db: Db, id: string): Promise<Omit<ListingWithOwner, "coverKey"> | undefined> {
  const rows = await db
    .select({ listing, ownerName: user.name })
    .from(listing)
    .innerJoin(user, eq(listing.ownerId, user.id))
    .where(eq(listing.id, id))
    .limit(1);
  return rows[0];
}

// Alle bildene til annonsesiden, forsidebildet først (#150).
export async function getListingImages(db: Db, listingId: string): Promise<string[]> {
  const rows = await db
    .select({ key: listingImage.key })
    .from(listingImage)
    .where(eq(listingImage.listingId, listingId))
    .orderBy(asc(listingImage.position));
  return rows.map((row) => row.key);
}
