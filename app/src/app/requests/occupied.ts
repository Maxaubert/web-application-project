// Låneperioder på en annonse (TK-06, #186, #208). En periode er opptatt når forespørselen er godtatt eller lånet er i bruk.
// Perioden hentes fra siste forslag, for et motforslag kan ha endret den.
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { offer, request } from "@/db/schema";
import type { Db } from "@/db/types";
import type { RequestStatus } from "./request-status";

export type Period = { startDate: string; endDate: string };
export type RequestPeriod = Period & { requestId: string };

// Datoene er ÅÅÅÅ-MM-DD, så tekstsammenligning er datosammenligning. Begge endedagene teller med,
// så perioder som deler én dag overlapper.
export function overlaps(a: Period, b: Period): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

// Siste periode per forespørsel med en av statusene, uten forespørselen excludeId (den som svares på nå).
async function latestPeriods(db: Db, listingId: string, statuses: RequestStatus[], excludeId?: string): Promise<RequestPeriod[]> {
  const rows = await db
    .select({ requestId: offer.requestId, startDate: offer.startDate, endDate: offer.endDate })
    .from(offer)
    .innerJoin(request, eq(offer.requestId, request.id))
    .where(
      and(eq(request.listingId, listingId), inArray(request.status, statuses), excludeId ? ne(request.id, excludeId) : undefined),
    )
    // rowid, ikke created_at: tidspunktet har bare hele sekunder.
    .orderBy(asc(sql`${offer}.rowid`));

  const latest = new Map<string, Period | null>();
  for (const row of rows) {
    latest.set(row.requestId, row.startDate && row.endDate ? { startDate: row.startDate, endDate: row.endDate } : null);
  }
  const periods: RequestPeriod[] = [];
  for (const [requestId, period] of latest) if (period) periods.push({ requestId, ...period });
  return periods.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getOccupiedPeriods(db: Db, listingId: string, excludeId?: string): Promise<Period[]> {
  const periods = await latestPeriods(db, listingId, ["accepted", "in_use"], excludeId);
  return periods.map(({ startDate, endDate }) => ({ startDate, endDate }));
}

// Forespørslene som venter på svar, med perioden de ber om. Brukes når et lån godtas (#208); den som nettopp er
// godtatt, venter ikke lenger og er ikke med.
export function getWaitingPeriods(db: Db, listingId: string): Promise<RequestPeriod[]> {
  return latestPeriods(db, listingId, ["waiting_owner", "waiting_requester"]);
}
