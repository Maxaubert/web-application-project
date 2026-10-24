// «Administrer»: endre en egen annonse (FK-11, TK-03, #229). Tar databasen som argument og vet ingenting om økt eller
// nettforespørsel; serverhandlingen updateListing i actions.ts henter brukeren fra økten og kaller hit. All autorisasjon
// ligger her. Bildene endres ikke her ennå (Max 24.10).
import { and, eq } from "drizzle-orm";
import { listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { validateListing, type ListingFormValues } from "./listing-schema";

type UpdateInput = { userId: string; listingId: string; values: ListingFormValues; now?: Date };
export type UpdateResult = { ok: true } | { ok: false; error: string } | { ok: false; fieldErrors: Record<string, string> };

const NOT_FOUND = "Annonsen finnes ikke";

export async function updateListingFields(db: Db, { userId, listingId, values, now = new Date() }: UpdateInput): Promise<UpdateResult> {
  // Bare eierens egen, aktive annonse. Andres annonser, ukjente id-er, solgte og nedtatte får samme svar.
  const rows = await db.select({ type: listing.type }).from(listing).where(and(eq(listing.id, listingId), eq(listing.ownerId, userId), eq(listing.status, "active"))).limit(1);
  const found = rows[0];
  if (!found) return { ok: false, error: NOT_FOUND };

  // Handelstypen er låst (Max 24.10): den hentes fra databasen, aldri fra skjemaet, så prisreglene alltid gjelder riktig type.
  const result = validateListing({ ...values, type: found.type });
  if (!result.success) return { ok: false, fieldErrors: result.fieldErrors };

  // Samme vilkår i oppdateringen: et salg eller en sletting som kom imellom, vinner. Eksisterende avtaler beholder sine
  // vilkår, for de står i offer-radene (D-51).
  const { title, description, category, condition, price } = result.data;
  const updated = await db
    .update(listing)
    .set({ title, description, category, condition, price, updatedAt: now })
    .where(and(eq(listing.id, listingId), eq(listing.ownerId, userId), eq(listing.status, "active")))
    .returning({ id: listing.id });
  if (updated.length === 0) return { ok: false, error: NOT_FOUND };
  return { ok: true };
}
