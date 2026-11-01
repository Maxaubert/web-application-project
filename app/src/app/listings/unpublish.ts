// «Ta ned» (FK-11, TK-03, #229). Tar databasen som argument og vet ingenting om økt eller nettforespørsel; serverhandlingen
// takeDownListing i actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her.
import { and, eq, inArray } from "drizzle-orm";
import { listing, request } from "@/db/schema";
import type { Db } from "@/db/types";

type UnpublishInput = { userId: string; listingId: string; now?: Date };
export type UnpublishResult = { ok: true } | { ok: false; error: string };

export async function unpublishListing(db: Db, { userId, listingId, now = new Date() }: UnpublishInput): Promise<UnpublishResult> {
  // Oppdateringen er selve kontrollen: bare eierens egen, aktive annonse endres. Andres annonser, ukjente id-er og annonser
  // som er solgt eller tatt ned, får samme svar. To trykk, eller et salg som godtas samtidig, kan ikke begge vinne.
  const taken = await db
    .update(listing)
    .set({ status: "unpublished", updatedAt: now })
    .where(and(eq(listing.id, listingId), eq(listing.ownerId, userId), eq(listing.status, "active")))
    .returning({ id: listing.id });
  if (taken.length === 0) return { ok: false, error: "Annonsen finnes ikke" };

  // Ventende forespørsler avslås, så forespørreren ser svaret med én gang (Max 24.10). Godtatte avtaler og lån i bruk
  // røres ikke: å ta ned annonsen endrer ikke eksisterende avtaler.
  await db
    .update(request)
    .set({ status: "declined", updatedAt: now })
    .where(and(eq(request.listingId, listingId), inArray(request.status, ["waiting_owner", "waiting_requester"])));
  return { ok: true };
}
