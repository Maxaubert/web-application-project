// Det eneste stedet som leser og skriver annonser i databasen (#256), etter Marius' repository-mønster: et interface som sier
// hvilke funksjoner som finnes, og en fabrikk som lager dem for en gitt database. Databasen kommer inn som argument, så
// testene kan bruke SQLite i minnet.
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { listing, listingImage, request, user, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { waitingStatuses } from "@/app/requests/request-status";

// coverKey: forsidebildets nøkkel i R2 (posisjon 0), eller null for annonser uten bilde (#150).
export type ListingWithOwner = { listing: Listing; ownerName: string; coverKey: string | null };
type NewListing = typeof listing.$inferInsert & { id: string };
type ListingFields = Pick<Listing, "title" | "description" | "category" | "condition" | "price">;

export interface ListingRepository {
  findActive(): Promise<ListingWithOwner[]>;
  findWithOwner(id: string): Promise<Omit<ListingWithOwner, "coverKey"> | undefined>;
  findImages(listingId: string): Promise<string[]>;
  findOwnActiveType(listingId: string, userId: string): Promise<Listing["type"] | undefined>;
  create(values: NewListing, imageKeys: string[]): Promise<void>;
  remove(listingId: string): Promise<void>;
  updateOwnActive(listingId: string, userId: string, fields: ListingFields, now: Date): Promise<boolean>;
  takeDownOwnActive(listingId: string, userId: string, now: Date): Promise<boolean>;
  declinePendingRequests(listingId: string, now: Date): Promise<void>;
}

// Bare eierens egen, aktive annonse: andres annonser, ukjente id-er, solgte og nedtatte treffer ikke.
const ownActive = (listingId: string, userId: string) => and(eq(listing.id, listingId), eq(listing.ownerId, userId), eq(listing.status, "active"));

export function createListingRepository(db: Db): ListingRepository {
  return {
    // Aktive annonser til forsiden, nyeste først (WF-03). Eierens navn følger med, så søket kan finne annonser på selgerens
    // navn (#97). Forsidebildet hentes med en left join, så annonser uten bilde også kommer med (#150).
    findActive() {
      return db
        .select({ listing, ownerName: user.name, coverKey: listingImage.key })
        .from(listing)
        .innerJoin(user, eq(listing.ownerId, user.id))
        .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
        .where(eq(listing.status, "active"))
        .orderBy(desc(listing.createdAt));
    },

    // Én annonse med eierens navn til annonsesiden (WF-04), uansett status; siden avgjør hva som vises. Bare navnet hentes
    // fra brukeren, så telefon og e-post aldri kan havne på siden.
    async findWithOwner(id) {
      const rows = await db.select({ listing, ownerName: user.name }).from(listing).innerJoin(user, eq(listing.ownerId, user.id)).where(eq(listing.id, id)).limit(1);
      return rows[0];
    },

    // Alle bildene til annonsesiden, forsidebildet først (#150).
    async findImages(listingId) {
      const rows = await db.select({ key: listingImage.key }).from(listingImage).where(eq(listingImage.listingId, listingId)).orderBy(asc(listingImage.position));
      return rows.map((row) => row.key);
    },

    // Handelstypen til eierens egen, aktive annonse, eller undefined.
    async findOwnActiveType(listingId, userId) {
      const rows = await db.select({ type: listing.type }).from(listing).where(ownActive(listingId, userId)).limit(1);
      return rows[0]?.type;
    },

    // Annonsen og bildene, i den rekkefølgen brukeren valgte dem.
    async create(values, imageKeys) {
      await db.insert(listing).values(values);
      if (imageKeys.length > 0) await db.insert(listingImage).values(imageKeys.map((key, position) => ({ listingId: values.id, key, position })));
    },

    async remove(listingId) {
      await db.delete(listing).where(eq(listing.id, listingId));
    },

    // Vilkåret står i selve oppdateringen: et salg eller en sletting som kom imellom, vinner. true hvis annonsen ble endret.
    async updateOwnActive(listingId, userId, fields, now) {
      const updated = await db.update(listing).set({ ...fields, updatedAt: now }).where(ownActive(listingId, userId)).returning({ id: listing.id });
      return updated.length > 0;
    },

    // Oppdateringen er selve kontrollen: to trykk, eller et salg som godtas samtidig, kan ikke begge vinne.
    async takeDownOwnActive(listingId, userId, now) {
      const taken = await db.update(listing).set({ status: "unpublished", updatedAt: now }).where(ownActive(listingId, userId)).returning({ id: listing.id });
      return taken.length > 0;
    },

    // Ventende forespørsler på annonsen avslås. Godtatte avtaler og lån i bruk røres ikke.
    async declinePendingRequests(listingId, now) {
      await db
        .update(request)
        .set({ status: "declined", updatedAt: now })
        .where(and(eq(request.listingId, listingId), inArray(request.status, waitingStatuses)));
    },
  };
}
