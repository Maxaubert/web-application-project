// Opptatte låneperioder (TK-06, #186). En periode er opptatt når forespørselen er godtatt eller lånet er i bruk.
// Perioden hentes fra siste forslag, for et motforslag kan ha endret den.
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { offer, request } from "@/db/schema";
import type { Db } from "@/db/types";

export type Period = { startDate: string; endDate: string };

// Datoene er ÅÅÅÅ-MM-DD, så tekstsammenligning er datosammenligning. Begge endedagene teller med,
// så perioder som deler én dag overlapper.
export function overlaps(a: Period, b: Period): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

export async function getOccupiedPeriods(db: Db, listingId: string): Promise<Period[]> {
  const rows = await db
    .select({ requestId: offer.requestId, startDate: offer.startDate, endDate: offer.endDate })
    .from(offer)
    .innerJoin(request, eq(offer.requestId, request.id))
    .where(and(eq(request.listingId, listingId), inArray(request.status, ["accepted", "in_use"])))
    // rowid, ikke created_at: tidspunktet har bare hele sekunder.
    .orderBy(asc(sql`${offer}.rowid`));

  const latest = new Map<string, Period | null>();
  for (const row of rows) {
    latest.set(row.requestId, row.startDate && row.endDate ? { startDate: row.startDate, endDate: row.endDate } : null);
  }
  return [...latest.values()].filter((p): p is Period => p !== null).sort((a, b) => a.startDate.localeCompare(b.startDate));
}
