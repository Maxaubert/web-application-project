// Det eneste stedet som leser data til Min side fra databasen (#193, #229, #256), etter Marius' repository-mønster: et
// interface og en fabrikk for en gitt database. Databasen kommer inn som argument, så testene kan bruke SQLite i minnet.
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { listing, listingImage, offer, request, user, type Listing, type Offer, type Request } from "@/db/schema";
import type { Db } from "@/db/types";

export type Profile = { name: string; email: string; phone: string | null };

export interface MeRepository {
  findProfile(userId: string): Promise<Profile | undefined>;
  findOwnActiveListings(userId: string): Promise<{ listing: Listing; coverKey: string | null }[]>;
  findRequestsOnOwnListings(userId: string): Promise<Request[]>;
  findOffersOnOwnListings(userId: string): Promise<Offer[]>;
}

export function createMeRepository(db: Db): MeRepository {
  return {
    // Bare den innloggedes egen rad; siden sender alltid sin egen userId, aldri en id fra adressen.
    async findProfile(userId) {
      const rows = await db.select({ name: user.name, email: user.email, phone: user.phone }).from(user).where(eq(user.id, userId)).limit(1);
      return rows[0];
    },

    // Egne aktive annonser med forsidebildet, nyeste først (Mine annonser, #229).
    findOwnActiveListings(userId) {
      return db
        .select({ listing, coverKey: listingImage.key })
        .from(listing)
        .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
        .where(and(eq(listing.ownerId, userId), eq(listing.status, "active")))
        .orderBy(desc(listing.createdAt));
    },

    // Forespørslene og forslagene hentes med en join på eieren, ikke med en liste av id-er: D1 godtar høyst 100 parametere
    // per spørring, så inArray feiler for en bruker med mange annonser (funnet av nettlesertesten 24.10).
    async findRequestsOnOwnListings(userId) {
      const rows = await db.select({ request }).from(request).innerJoin(listing, eq(request.listingId, listing.id)).where(eq(listing.ownerId, userId));
      return rows.map((row) => row.request);
    },

    // Eldste først, så et senere forslag kan overskrive et tidligere.
    async findOffersOnOwnListings(userId) {
      const rows = await db
        .select({ offer })
        .from(offer)
        .innerJoin(request, eq(offer.requestId, request.id))
        .innerJoin(listing, eq(request.listingId, listing.id))
        .where(eq(listing.ownerId, userId))
        .orderBy(asc(sql`${offer}.rowid`));
      return rows.map((row) => row.offer);
    },
  };
}
