// Databasespørringer for forespørsler. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { offer, request } from "@/db/schema";
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
