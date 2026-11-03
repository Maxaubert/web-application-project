// Det eneste stedet som leser og skriver favoritter i databasen (FK-14, #224, #256). Mønsteret er Marius' repository fra
// hiof-live-2026: et interface som sier hvilke funksjoner som finnes, og en fabrikk som lager dem for en gitt database.
// Databasen kommer inn som argument, så testene kan bruke SQLite i minnet.
import { and, desc, eq } from "drizzle-orm";
import { favorite, listing, listingImage, user } from "@/db/schema";
import type { Db } from "@/db/types";
import type { ListingWithOwner } from "@/app/listings/queries";

export interface FavoriteRepository {
  findListing(listingId: string): Promise<{ ownerId: string; status: string } | undefined>;
  add(userId: string, listingId: string): Promise<void>;
  remove(userId: string, listingId: string): Promise<void>;
  findListings(userId: string): Promise<ListingWithOwner[]>;
  findIds(userId: string): Promise<Set<string>>;
}

export function createFavoriteRepository(db: Db): FavoriteRepository {
  return {
    // Eieren og statusen til annonsen, så reglene kan avgjøre om den kan lagres.
    async findListing(listingId) {
      const rows = await db.select({ ownerId: listing.ownerId, status: listing.status }).from(listing).where(eq(listing.id, listingId)).limit(1);
      return rows[0];
    },

    // To trykk, eller to faner samtidig, gir fortsatt én rad: nøkkelen er paret.
    async add(userId, listingId) {
      await db.insert(favorite).values({ userId, listingId }).onConflictDoNothing();
    },

    // Sletter bare brukerens egen rad.
    async remove(userId, listingId) {
      await db.delete(favorite).where(and(eq(favorite.userId, userId), eq(favorite.listingId, listingId)));
    },

    // Mine favoritter, sist lagret først, med eierens navn til raden på Min side. Bare aktive annonser: solgte, gitt bort og
    // nedtatte skjules, men raden blir liggende, så favoritten kommer tilbake hvis et salg avbestilles (Max 24.10).
    findListings(userId) {
      return db
        .select({ listing, ownerName: user.name, coverKey: listingImage.key })
        .from(favorite)
        .innerJoin(listing, eq(favorite.listingId, listing.id))
        .innerJoin(user, eq(listing.ownerId, user.id))
        .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
        .where(and(eq(favorite.userId, userId), eq(listing.status, "active")))
        .orderBy(desc(favorite.createdAt));
    },

    // Hvilke annonser brukeren har lagret, så hjertene på kortene og annonsesiden kan vises fylt.
    async findIds(userId) {
      const rows = await db.select({ listingId: favorite.listingId }).from(favorite).where(eq(favorite.userId, userId));
      return new Set(rows.map((row) => row.listingId));
    },
  };
}
