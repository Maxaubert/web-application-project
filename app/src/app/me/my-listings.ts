// Mine annonser på Min side (FK-11, #229): alle egne annonser, også solgte og nedtatte, med det statuslinjen trenger.
// Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { listing, listingImage, offer, request, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { handoverEffective } from "@/app/requests/auto-confirm";
import { effectiveStatus } from "@/app/requests/request-expiry";

// pending: ventende forespørsler som ikke er utløpt. loanedUntil: siste dag i et lån i bruk (YYYY-MM-DD), ellers null.
export type MyListing = { listing: Listing; coverKey: string | null; pending: number; loanedUntil: string | null };

export async function getMyListings(db: Db, userId: string, now = new Date()): Promise<MyListing[]> {
  const rows = await db
    .select({ listing, coverKey: listingImage.key })
    .from(listing)
    .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
    .where(eq(listing.ownerId, userId))
    .orderBy(desc(listing.createdAt));

  const ids = rows.map((row) => row.listing.id);
  const requests = ids.length === 0 ? [] : await db.select().from(request).where(inArray(request.listingId, ids));
  const offers =
    requests.length === 0
      ? []
      : await db
          .select()
          .from(offer)
          .where(inArray(offer.requestId, requests.map((r) => r.id)))
          .orderBy(asc(sql`${offer}.rowid`));
  // Senere forslag overskriver tidligere, så mappet ender med det siste per forespørsel.
  const latest = new Map(offers.map((o) => [o.requestId, o]));

  return rows.map(({ listing: ad, coverKey }) => {
    let pending = 0;
    let loanedUntil: string | null = null;
    for (const r of requests.filter((r) => r.listingId === ad.id)) {
      const last = latest.get(r.id);
      const status = effectiveStatus(handoverEffective(r, ad.type, now).status, last?.createdAt ?? r.createdAt, now);
      if (status === "waiting_owner" || status === "waiting_requester") pending++;
      if (status === "in_use") loanedUntil = last?.endDate ?? null;
    }
    return { listing: ad, coverKey, pending, loanedUntil };
  });
}
