// Utløp etter 7 dager uten svar (FK-08, AK-39, #187). Mekanismen er «lat»: ingen planlagt jobb. Lesing regner ut
// at en forespørsel er utløpt (effectiveStatus), og skriving lagrer det (expireIfDue) før den gjør noe annet.
// Da trenger ingen cron, og en GET endrer aldri databasen.
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { offer, request } from "@/db/schema";
import type { Db } from "@/db/types";
import type { RequestStatus } from "./request-status";

export const EXPIRY_DAYS = 7;
const DAY_MS = 86_400_000;
const waitingStatuses: RequestStatus[] = ["waiting_owner", "waiting_requester"];

// Klokken regnes fra siste forslag: et nytt bud eller motbud starter 7 nye dager.
export function effectiveStatus(status: RequestStatus, lastOfferAt: Date, now: Date): RequestStatus {
  if (!waitingStatuses.includes(status)) return status;
  return now.getTime() - lastOfferAt.getTime() >= EXPIRY_DAYS * DAY_MS ? "expired" : status;
}

// Lagrer utløpet. Sant bare når dette kallet flyttet forespørselen til expired; en parallell skriving som kom først
// (status er endret siden vi leste) gir usant, og forespørselen blir som den er. Nyeste forslag sorteres på rowid:
// created_at har bare hele sekunder.
export async function expireIfDue(db: Db, requestId: string, now: Date): Promise<boolean> {
  const rows = await db
    .select({ status: request.status, lastOfferAt: offer.createdAt })
    .from(request)
    .innerJoin(offer, eq(offer.requestId, request.id))
    .where(eq(request.id, requestId))
    .orderBy(desc(sql`${offer}.rowid`))
    .limit(1);
  const row = rows[0];
  if (!row || effectiveStatus(row.status, row.lastOfferAt, now) === row.status) return false;

  const changed = await db
    .update(request)
    .set({ status: "expired", updatedAt: now })
    .where(and(eq(request.id, requestId), eq(request.status, row.status)))
    .returning({ id: request.id });
  return changed.length > 0;
}

// Brukes før et nytt bud: en utløpt forespørsel som ikke er lagret som utløpt, står i veien for den delvis unike
// indeksen (én pågående per student per annonse).
export async function expireOverdueRequest(db: Db, listingId: string, requesterId: string, now: Date): Promise<void> {
  const rows = await db
    .select({ id: request.id })
    .from(request)
    .where(and(eq(request.listingId, listingId), eq(request.requesterId, requesterId), inArray(request.status, waitingStatuses)));
  for (const row of rows) await expireIfDue(db, row.id, now);
}
