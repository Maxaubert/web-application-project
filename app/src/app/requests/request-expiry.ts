// Utløp etter 7 dager uten svar (FK-08, AK-39, #187). Mekanismen er «lat»: ingen planlagt jobb. Lesing regner ut
// at en forespørsel er utløpt (effectiveStatus), og skriving lagrer det (expireIfDue) før den gjør noe annet.
// Da trenger ingen cron, og en GET endrer aldri databasen.
import type { Db } from "@/db/types";
import type { RequestStatus } from "./request-status";
import { createRequestRepository } from "./repository";

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
  const repository = createRequestRepository(db);
  const row = await repository.findStatusAndLastOffer(requestId);
  if (!row || effectiveStatus(row.status, row.lastOfferAt, now) === row.status) return false;
  return repository.moveStatus(requestId, row.status, "expired", now);
}

// Brukes før et nytt bud: en utløpt forespørsel som ikke er lagret som utløpt, står i veien for den delvis unike
// indeksen (én pågående per student per annonse).
export async function expireOverdueRequest(db: Db, listingId: string, requesterId: string, now: Date): Promise<void> {
  const ids = await createRequestRepository(db).findWaitingIds(listingId, requesterId);
  for (const id of ids) await expireIfDue(db, id, now);
}
