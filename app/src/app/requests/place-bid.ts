// Forretningsreglene for å legge inn et bud (FK-04). Tar databasen som argument og vet ingenting om økt eller
// nettforespørsel; serverhandlingen sendBid i actions.ts henter brukeren fra økten og kaller hit. All
// autorisasjon ligger her, så en skjult eller grået knapp aldri er det eneste som stopper et ulovlig bud.
import { eq } from "drizzle-orm";
import { listing, offer, request } from "@/db/schema";
import type { Db } from "@/db/types";
import { validateOffer } from "./offer-rules";
import { getActiveRequest } from "./queries";
import { expireOverdueRequest } from "./request-expiry";

type PlaceBidInput = { userId: string; listingId: string; price: string; now?: Date };
export type PlaceBidResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const NOT_AVAILABLE = "Du kan ikke legge inn bud på denne annonsen";

export async function placeBid(db: Db, { userId, listingId, price, now = new Date() }: PlaceBidInput): Promise<PlaceBidResult> {
  const rows = await db.select().from(listing).where(eq(listing.id, listingId)).limit(1);
  const found = rows[0];
  // Samme melding for ukjent, nedtatt, solgt og feil type, så ingen kan lese hva som finnes ut av den.
  if (!found || found.status !== "active" || found.type !== "sale") return { ok: false, error: NOT_AVAILABLE };
  if (found.ownerId === userId) return { ok: false, error: "Du kan ikke by på din egen annonse" };

  // Budet valideres på serveren også om skjemaet har gjort det; TypeScript sjekker ingenting i kjøretid.
  const validated = validateOffer("sale", { price });
  if (!validated.success) return { ok: false, fieldErrors: validated.fieldErrors };
  const bid = validated.data.price;

  // Et bud som har ligget ubesvart i 7 dager er utløpt (#187). Det lagres først, ellers står det i veien for et nytt bud.
  await expireOverdueRequest(db, listingId, userId, now);
  const existing = await getActiveRequest(db, listingId, userId, now);
  if (existing) {
    // Et nytt bud erstatter det gamle så lenge selgeren ikke har svart. Det gamle blir stående som historikk.
    if (existing.status !== "waiting_owner") return { ok: false, error: "Du har allerede en forespørsel på denne annonsen" };
    await db.insert(offer).values({ requestId: existing.id, senderId: userId, price: bid });
    return { ok: true };
  }

  // D1 har ingen transaksjoner. Feiler budet etter at forespørselen er lagret, slettes forespørselen igjen
  // (cascade rydder offer), så det aldri blir en forespørsel uten bud.
  const requestId = crypto.randomUUID();
  try {
    await db.insert(request).values({ id: requestId, listingId, requesterId: userId });
    await db.insert(offer).values({ requestId, senderId: userId, price: bid });
  } catch (error) {
    await db.delete(request).where(eq(request.id, requestId));
    throw error;
  }
  return { ok: true };
}
