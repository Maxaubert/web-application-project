// «Administrer»: endre en egen annonse (FK-11, TK-03, #229). Reglene: vet ingenting om økt eller nettforespørsel, og
// snakker med databasen bare gjennom repositoryet (#256). Serverhandlingen updateListing i actions.ts henter brukeren fra
// økten og kaller hit. All autorisasjon ligger her. Bildene endres ikke her ennå (Max 24.10).
import type { Db } from "@/db/types";
import { validateListing, type ListingFormValues } from "./listing-schema";
import { createListingRepository } from "./repository";

type UpdateInput = { userId: string; listingId: string; values: ListingFormValues; now?: Date };
export type UpdateResult = { ok: true } | { ok: false; error: string } | { ok: false; fieldErrors: Record<string, string> };

const NOT_FOUND = "Annonsen finnes ikke";

export async function updateListingFields(db: Db, { userId, listingId, values, now = new Date() }: UpdateInput): Promise<UpdateResult> {
  const repository = createListingRepository(db);

  // Bare eierens egen, aktive annonse. Andres annonser, ukjente id-er, solgte og nedtatte får samme svar.
  const type = await repository.findOwnActiveType(listingId, userId);
  if (!type) return { ok: false, error: NOT_FOUND };

  // Handelstypen er låst (Max 24.10): den hentes fra databasen, aldri fra skjemaet, så prisreglene alltid gjelder riktig type.
  const result = validateListing({ ...values, type });
  if (!result.success) return { ok: false, fieldErrors: result.fieldErrors };

  // Eksisterende avtaler beholder sine vilkår, for de står i offer-radene (D-51).
  const { title, description, category, condition, price } = result.data;
  const updated = await repository.updateOwnActive(listingId, userId, { title, description, category, condition, price }, now);
  if (!updated) return { ok: false, error: NOT_FOUND };
  return { ok: true };
}
