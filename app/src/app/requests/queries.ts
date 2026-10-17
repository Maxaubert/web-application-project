// Databasespørringer for forespørsler. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { listing, listingImage, offer, request, user, type Listing, type Offer, type Request } from "@/db/schema";
import type { Db } from "@/db/types";
import { activeStatuses, type RequestStatus } from "./request-status";

// price: det siste budet (nyeste offer-rad). Salg har alltid pris, men kolonnen kan være tom for lån og gis bort.
export type ActiveRequest = { id: string; status: RequestStatus; price: number | null };

// Studentens pågående forespørsel på en annonse, med siste bud, eller undefined. Det finnes høyst én (indeksen
// request_one_active_per_student_idx). Nyeste offer sorteres på rowid: created_at har bare hele sekunder, så to
// bud i samme sekund ville ellers stått likt.
export async function getActiveRequest(db: Db, listingId: string, requesterId: string): Promise<ActiveRequest | undefined> {
  const rows = await db
    .select({ id: request.id, status: request.status, price: offer.price })
    .from(request)
    .innerJoin(offer, eq(offer.requestId, request.id))
    .where(and(eq(request.listingId, listingId), eq(request.requesterId, requesterId), inArray(request.status, activeStatuses)))
    .orderBy(desc(sql`${offer}.rowid`))
    .limit(1);
  return rows[0];
}

export type RequestRole = "owner" | "requester";

// Én rad i listen på Min side (#193): forespørselen sett fra den innloggede.
// otherName: den andre parten (kjøperen for eieren, selgeren for kjøperen). price og changedAt kommer fra siste bud.
export type MyRequest = {
  id: string;
  status: RequestStatus;
  role: RequestRole;
  listing: Listing;
  coverKey: string | null;
  otherName: string;
  price: number | null;
  changedAt: Date;
};

// Alle forespørslene der brukeren er eier av annonsen eller har lagt inn forespørselen, med siste bud og forsidebilde.
// To spørringer i stedet for én per rad: først forespørslene, så budene til dem. Siste bud er det med høyest rowid
// (created_at har bare hele sekunder). Rekkefølgen avgjøres av siden, ikke her.
export async function getRequestsForUser(db: Db, userId: string): Promise<MyRequest[]> {
  const owner = alias(user, "owner");
  const requester = alias(user, "requester");
  const rows = await db
    .select({ request, listing, ownerName: owner.name, requesterName: requester.name, coverKey: listingImage.key })
    .from(request)
    .innerJoin(listing, eq(request.listingId, listing.id))
    .innerJoin(owner, eq(listing.ownerId, owner.id))
    .innerJoin(requester, eq(request.requesterId, requester.id))
    .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
    .where(or(eq(request.requesterId, userId), eq(listing.ownerId, userId)));

  const offers = await db
    .select()
    .from(offer)
    .where(inArray(offer.requestId, rows.map((row) => row.request.id)))
    .orderBy(asc(sql`${offer}.rowid`));
  // Senere bud overskriver tidligere, så mappet ender med det siste per forespørsel.
  const latest = new Map<string, Offer>(offers.map((o) => [o.requestId, o]));

  return rows.map((row) => {
    const role: RequestRole = row.listing.ownerId === userId ? "owner" : "requester";
    const last = latest.get(row.request.id);
    return {
      id: row.request.id,
      status: row.request.status,
      role,
      listing: row.listing,
      coverKey: row.coverKey,
      otherName: role === "owner" ? row.requesterName : row.ownerName,
      price: last?.price ?? null,
      changedAt: last?.createdAt ?? row.request.createdAt,
    };
  });
}

export type RequestDetails = {
  request: Request;
  listing: Listing;
  ownerName: string;
  requesterName: string;
  // Alle forslagene, det eldste først. Det siste er gjeldende.
  offers: Offer[];
  role: RequestRole;
};

// Forespørselen med annonsen, begge parters navn og alle forslagene, men bare for de to partene: eieren av annonsen
// og den som la inn forespørselen. For alle andre, og for en ukjent id, er svaret undefined (siden gir 404).
// Bare navnene hentes fra brukerne, så telefon og e-post aldri kan havne på siden før avtalen er godtatt.
export async function getRequestForParty(db: Db, requestId: string, userId: string): Promise<RequestDetails | undefined> {
  const owner = alias(user, "owner");
  const requester = alias(user, "requester");
  const rows = await db
    .select({ request, listing, ownerName: owner.name, requesterName: requester.name })
    .from(request)
    .innerJoin(listing, eq(request.listingId, listing.id))
    .innerJoin(owner, eq(listing.ownerId, owner.id))
    .innerJoin(requester, eq(request.requesterId, requester.id))
    .where(and(eq(request.id, requestId), or(eq(request.requesterId, userId), eq(listing.ownerId, userId))))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;

  // rowid av samme grunn som i getActiveRequest: created_at har bare hele sekunder.
  const offers = await db.select().from(offer).where(eq(offer.requestId, requestId)).orderBy(asc(sql`${offer}.rowid`));
  return { ...row, offers, role: row.listing.ownerId === userId ? "owner" : "requester" };
}
