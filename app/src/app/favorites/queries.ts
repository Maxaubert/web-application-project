// Databasespørringer for favoritter (FK-14, #224). Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, desc, eq } from "drizzle-orm";
import { favorite, listing, listingImage } from "@/db/schema";
import type { Db } from "@/db/types";
import type { ListingWithOwner } from "@/app/listings/queries";

export type FavoriteListing = Omit<ListingWithOwner, "ownerName">;

// Mine favoritter, sist lagret først. Bare aktive annonser: solgte, gitt bort og nedtatte skjules, men raden blir
// liggende, så favoritten kommer tilbake hvis et salg avbestilles (Max 24.10). Utlånte lån er fortsatt aktive.
export function getFavoriteListings(db: Db, userId: string): Promise<FavoriteListing[]> {
  return db
    .select({ listing, coverKey: listingImage.key })
    .from(favorite)
    .innerJoin(listing, eq(favorite.listingId, listing.id))
    .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
    .where(and(eq(favorite.userId, userId), eq(listing.status, "active")))
    .orderBy(desc(favorite.createdAt));
}

// Hvilke annonser brukeren har lagret, så hjertene på kortene og annonsesiden kan vises fylt.
export async function getFavoriteIds(db: Db, userId: string): Promise<Set<string>> {
  const rows = await db.select({ listingId: favorite.listingId }).from(favorite).where(eq(favorite.userId, userId));
  return new Set(rows.map((row) => row.listingId));
}
