// Forretningsreglene for å sende en forespørsel (FK-04, FK-05): bud på salg, periode på lån og ren forespørsel på
// gis bort. Tar databasen som argument og vet ingenting om økt eller nettforespørsel; serverhandlingene i
// actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her, så en skjult eller grået knapp
// aldri er det eneste som stopper en ulovlig forespørsel.
import { eq } from "drizzle-orm";
import { listing, offer, request, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { getOccupiedPeriods, overlaps } from "./occupied";
import { validateOffer, type OfferValues } from "./offer-rules";
import { getActiveRequest } from "./queries";
import { expireOverdueRequest } from "./request-expiry";

export type PlaceRequestInput = OfferValues & { userId: string; listingId: string; now?: Date };
export type PlaceRequestResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

// Samme melding for ukjent, nedtatt, solgt og tatt-av-andre, så ingen kan lese hva som finnes ut av den.
const notAvailable = (type: Listing["type"]) =>
  type === "sale" ? "Du kan ikke legge inn bud på denne annonsen" : "Du kan ikke sende forespørsel på denne annonsen";

export async function placeRequest(db: Db, { userId, listingId, now = new Date(), ...values }: PlaceRequestInput): Promise<PlaceRequestResult> {
  const rows = await db.select().from(listing).where(eq(listing.id, listingId)).limit(1);
  const found = rows[0];
  if (!found || found.status !== "active") return { ok: false, error: notAvailable(found?.type ?? "sale") };
  if (found.ownerId === userId) {
    return { ok: false, error: found.type === "sale" ? "Du kan ikke by på din egen annonse" : "Du kan ikke sende forespørsel på din egen annonse" };
  }

  // Innholdet valideres på serveren også om skjemaet har gjort det; TypeScript sjekker ingenting i kjøretid.
  const validated = validateOffer(found.type, values);
  if (!validated.success) return { ok: false, fieldErrors: validated.fieldErrors };
  const { price, startDate, endDate } = validated.data;

  if (found.type === "loan" && startDate && endDate) {
    const taken = await getOccupiedPeriods(db, listingId);
    if (taken.some((period) => overlaps(period, { startDate, endDate }))) {
      return { ok: false, error: "Perioden overlapper en opptatt periode" };
    }
  }

  // En forespørsel som har ligget ubesvart i 7 dager er utløpt (#187). Det lagres først, ellers står den i veien for en ny.
  await expireOverdueRequest(db, listingId, userId, now);
  const existing = await getActiveRequest(db, listingId, userId, now);
  if (existing) {
    // Bare et bud kan endres mens selgeren ikke har svart; det nye erstatter det gamle, som blir stående som historikk.
    if (found.type !== "sale" || existing.status !== "waiting_owner") {
      return { ok: false, error: "Du har allerede en forespørsel på denne annonsen" };
    }
    await db.insert(offer).values({ requestId: existing.id, senderId: userId, price, startDate, endDate });
    return { ok: true };
  }

  // D1 har ingen transaksjoner. Feiler forslaget etter at forespørselen er lagret, slettes forespørselen igjen
  // (cascade rydder offer), så det aldri blir en forespørsel uten forslag.
  const requestId = crypto.randomUUID();
  try {
    await db.insert(request).values({ id: requestId, listingId, requesterId: userId });
    await db.insert(offer).values({ requestId, senderId: userId, price, startDate, endDate });
  } catch (error) {
    await db.delete(request).where(eq(request.id, requestId));
    throw error;
  }
  return { ok: true };
}
