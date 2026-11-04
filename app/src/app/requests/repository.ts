// Det eneste stedet som leser og skriver forespørsler og forslag i databasen (#256), etter Marius' repository-mønster: et
// interface og en fabrikk for en gitt database. Reglene (respond.ts, handover.ts og de andre) avgjør hva som skal skje;
// her står bare hvordan det leses og lagres. Databasen kommer inn som argument, så testene kan bruke SQLite i minnet.
//
// D1 har ingen transaksjoner. Derfor er skrivingene betingede: en status flyttes bare hvis den fortsatt er den reglene
// leste, og svaret (true eller false) forteller om akkurat dette kallet vant. Det er dette som hindrer to samtidige
// aksepter i å begge lykkes.
import { and, asc, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { listing, listingImage, offer, request, user, type Listing, type Offer, type Request } from "@/db/schema";
import type { Db } from "@/db/types";
import { activeStatuses, waitingStatuses, type RequestStatus } from "./request-status";


// Rader med begge parters navn, slik databasen gir dem. Statusen regnes ut i find-requests.ts.
export type PartyRow = { request: Request; listing: Listing; ownerName: string; requesterName: string };
export type ActiveRow = { id: string; status: RequestStatus; price: number | null; startDate: string | null; endDate: string | null; lastOfferAt: Date };
export type PeriodRow = { requestId: string; startDate: string | null; endDate: string | null };
export type Contact = { name: string; email: string; phone: string | null };
type NewOffer = { id?: string; requestId: string; senderId: string; price?: number | null; startDate?: string | null; endDate?: string | null };
type Confirmations = Pick<Request, "ownerConfirmed" | "requesterConfirmed">;

export interface RequestRepository {
  // Lesing
  findListing(listingId: string): Promise<Listing | undefined>;
  findActiveWithLastOffer(listingId: string, requesterId: string): Promise<ActiveRow | undefined>;
  findForUser(userId: string): Promise<(PartyRow & { coverKey: string | null })[]>;
  findOffersForUser(userId: string): Promise<Offer[]>;
  findForParty(requestId: string, userId: string): Promise<PartyRow | undefined>;
  findOffers(requestId: string): Promise<Offer[]>;
  findPeriods(listingId: string, statuses: RequestStatus[], excludeId?: string): Promise<PeriodRow[]>;
  findContact(userId: string): Promise<Contact | undefined>;
  findWithListingType(requestId: string): Promise<{ request: Request; type: Listing["type"] } | undefined>;
  findStatusAndLastOffer(requestId: string): Promise<{ status: RequestStatus; lastOfferAt: Date } | undefined>;
  findWaitingIds(listingId: string, requesterId: string): Promise<string[]>;
  // Skriving
  create(requestId: string, listingId: string, requesterId: string): Promise<void>;
  remove(requestId: string): Promise<void>;
  addOffer(values: NewOffer): Promise<void>;
  removeOffer(offerId: string): Promise<void>;
  moveStatus(requestId: string, from: RequestStatus, to: RequestStatus, updatedAt: Date): Promise<boolean>;
  confirmSide(requestId: string, side: "owner" | "requester", now: Date): Promise<Confirmations | undefined>;
  settleHandover(requestId: string, next: Pick<Request, "status"> & Confirmations, seen: Confirmations, now: Date): Promise<boolean>;
  declineWaiting(requestIds: string[], now: Date): Promise<void>;
  declineOtherWaiting(listingId: string, exceptRequestId: string, now: Date): Promise<void>;
  markListingSold(listingId: string, now: Date): Promise<boolean>;
  relistIfSold(listingId: string, now: Date): Promise<void>;
}

export function createRequestRepository(db: Db): RequestRepository {
  const owner = alias(user, "owner");
  const requester = alias(user, "requester");
  // Forespørselen med annonsen og begge parters navn. Bare navnene hentes fra brukerne, så telefon og e-post aldri kan havne
  // på siden før avtalen er godtatt.
  const withParties = () =>
    db
      .select({ request, listing, ownerName: owner.name, requesterName: requester.name })
      .from(request)
      .innerJoin(listing, eq(request.listingId, listing.id))
      .innerJoin(owner, eq(listing.ownerId, owner.id))
      .innerJoin(requester, eq(request.requesterId, requester.id));

  return {
    async findListing(listingId) {
      const rows = await db.select().from(listing).where(eq(listing.id, listingId)).limit(1);
      return rows[0];
    },

    // Studentens pågående forespørsel på en annonse, med siste bud. Det finnes høyst én (indeksen
    // request_one_active_per_student_idx). Nyeste forslag sorteres på rowid: created_at har bare hele sekunder.
    async findActiveWithLastOffer(listingId, requesterId) {
      const rows = await db
        .select({ id: request.id, status: request.status, price: offer.price, startDate: offer.startDate, endDate: offer.endDate, lastOfferAt: offer.createdAt })
        .from(request)
        .innerJoin(offer, eq(offer.requestId, request.id))
        .where(and(eq(request.listingId, listingId), eq(request.requesterId, requesterId), inArray(request.status, activeStatuses)))
        .orderBy(desc(sql`${offer}.rowid`))
        .limit(1);
      return rows[0];
    },

    // Alle forespørslene der brukeren er eier av annonsen eller har lagt inn forespørselen, med forsidebildet.
    findForUser(userId) {
      return db
        .select({ request, listing, ownerName: owner.name, requesterName: requester.name, coverKey: listingImage.key })
        .from(request)
        .innerJoin(listing, eq(request.listingId, listing.id))
        .innerJoin(owner, eq(listing.ownerId, owner.id))
        .innerJoin(requester, eq(request.requesterId, requester.id))
        .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
        .where(or(eq(request.requesterId, userId), eq(listing.ownerId, userId)));
    },

    // Budene hentes med samme vilkår som forespørslene, ikke med en liste av id-er: D1 godtar høyst 100 parametere per
    // spørring (#220, #229). Eldste først, så et senere bud kan overskrive et tidligere.
    async findOffersForUser(userId) {
      const rows = await db
        .select({ offer })
        .from(offer)
        .innerJoin(request, eq(offer.requestId, request.id))
        .innerJoin(listing, eq(request.listingId, listing.id))
        .where(or(eq(request.requesterId, userId), eq(listing.ownerId, userId)))
        .orderBy(asc(sql`${offer}.rowid`));
      return rows.map((row) => row.offer);
    },

    // Bare de to partene finner forespørselen: eieren av annonsen og den som la den inn. Alle andre får undefined.
    async findForParty(requestId, userId) {
      const rows = await withParties()
        .where(and(eq(request.id, requestId), or(eq(request.requesterId, userId), eq(listing.ownerId, userId))))
        .limit(1);
      return rows[0];
    },

    // Alle forslagene på en forespørsel, det eldste først (rowid: created_at har bare hele sekunder).
    findOffers(requestId) {
      return db.select().from(offer).where(eq(offer.requestId, requestId)).orderBy(asc(sql`${offer}.rowid`));
    },

    // Periodene i forslagene på en annonse for forespørsler med en av statusene, eldste først, uten excludeId.
    findPeriods(listingId, statuses, excludeId) {
      return db
        .select({ requestId: offer.requestId, startDate: offer.startDate, endDate: offer.endDate })
        .from(offer)
        .innerJoin(request, eq(offer.requestId, request.id))
        .where(and(eq(request.listingId, listingId), inArray(request.status, statuses), excludeId ? ne(request.id, excludeId) : undefined))
        .orderBy(asc(sql`${offer}.rowid`));
    },

    // Navn, e-post og telefon. Brukes bare av contact.ts, som sjekker at avtalen er godtatt først.
    async findContact(userId) {
      const rows = await db.select({ name: user.name, email: user.email, phone: user.phone }).from(user).where(eq(user.id, userId)).limit(1);
      return rows[0];
    },

    async findWithListingType(requestId) {
      const rows = await db.select({ request, type: listing.type }).from(request).innerJoin(listing, eq(request.listingId, listing.id)).where(eq(request.id, requestId)).limit(1);
      return rows[0];
    },

    async findStatusAndLastOffer(requestId) {
      const rows = await db
        .select({ status: request.status, lastOfferAt: offer.createdAt })
        .from(request)
        .innerJoin(offer, eq(offer.requestId, request.id))
        .where(eq(request.id, requestId))
        .orderBy(desc(sql`${offer}.rowid`))
        .limit(1);
      return rows[0];
    },

    async findWaitingIds(listingId, requesterId) {
      const rows = await db
        .select({ id: request.id })
        .from(request)
        .where(and(eq(request.listingId, listingId), eq(request.requesterId, requesterId), inArray(request.status, waitingStatuses)));
      return rows.map((row) => row.id);
    },

    async create(requestId, listingId, requesterId) {
      await db.insert(request).values({ id: requestId, listingId, requesterId });
    },

    // Sletter forespørselen; cascade rydder forslagene.
    async remove(requestId) {
      await db.delete(request).where(eq(request.id, requestId));
    },

    async addOffer(values) {
      await db.insert(offer).values(values);
    },

    async removeOffer(offerId) {
      await db.delete(offer).where(eq(offer.id, offerId));
    },

    // Flytter statusen bare hvis den fortsatt er from. true hvis dette kallet vant.
    async moveStatus(requestId, from, to, updatedAt) {
      const changed = await db
        .update(request)
        .set({ status: to, updatedAt })
        .where(and(eq(request.id, requestId), eq(request.status, from)))
        .returning({ id: request.id });
      return changed.length > 0;
    },

    // Setter egen bekreftelse så lenge forespørselen er godtatt. Raden som kommer tilbake viser begge flaggene slik de var
    // da oppdateringen gikk gjennom, eller undefined hvis den ikke lenger er godtatt.
    async confirmSide(requestId, side, now) {
      const updated = await db
        .update(request)
        .set({ ...(side === "owner" ? { ownerConfirmed: true } : { requesterConfirmed: true }), updatedAt: now })
        .where(and(eq(request.id, requestId), eq(request.status, "accepted")))
        .returning({ ownerConfirmed: request.ownerConfirmed, requesterConfirmed: request.requesterConfirmed });
      return updated[0];
    },

    // Lagrer den automatiske bekreftelsen, men bare hvis flaggene fortsatt er slik reglene så dem.
    async settleHandover(requestId, next, seen, now) {
      const changed = await db
        .update(request)
        .set({ ...next, updatedAt: now })
        .where(
          and(
            eq(request.id, requestId),
            eq(request.status, "accepted"),
            eq(request.ownerConfirmed, seen.ownerConfirmed),
            eq(request.requesterConfirmed, seen.requesterConfirmed),
          ),
        )
        .returning({ id: request.id });
      return changed.length > 0;
    },

    // Avslår de oppgitte forespørslene, men bare de som fortsatt venter.
    async declineWaiting(requestIds, now) {
      if (requestIds.length === 0) return;
      await db
        .update(request)
        .set({ status: "declined", updatedAt: now })
        .where(and(inArray(request.id, requestIds), inArray(request.status, waitingStatuses)));
    },

    // Avslår alle andre som venter på samme annonse. Avsluttede og godtatte røres ikke.
    async declineOtherWaiting(listingId, exceptRequestId, now) {
      await db
        .update(request)
        .set({ status: "declined", updatedAt: now })
        .where(and(eq(request.listingId, listingId), ne(request.id, exceptRequestId), inArray(request.status, waitingStatuses)));
    },

    // Tar annonsen ut av søket bare hvis den fortsatt er aktiv: den andre av to samtidige aksepter finner den solgt.
    async markListingSold(listingId, now) {
      const taken = await db
        .update(listing)
        .set({ status: "sold", updatedAt: now })
        .where(and(eq(listing.id, listingId), eq(listing.status, "active")))
        .returning({ id: listing.id });
      return taken.length > 0;
    },

    // Legger ut igjen bare en annonse som er solgt. Har eieren tatt den ned i mellomtiden, forblir den nede.
    async relistIfSold(listingId, now) {
      await db.update(listing).set({ status: "active", updatedAt: now }).where(and(eq(listing.id, listingId), eq(listing.status, "sold")));
    },
  };
}
