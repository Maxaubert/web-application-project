// «Ta ned» (FK-11, TK-03, #229). Reglene: vet ingenting om økt eller nettforespørsel, og snakker med databasen bare gjennom
// repositoryet (#256). Serverhandlingen takeDownListing i actions.ts henter brukeren fra økten og kaller hit. All
// autorisasjon ligger her.
import type { Db } from "@/db/types";
import { createListingRepository } from "./repository";

type UnpublishInput = { userId: string; listingId: string; now?: Date };
export type UnpublishResult = { ok: true } | { ok: false; error: string };

export async function unpublishListing(db: Db, { userId, listingId, now = new Date() }: UnpublishInput): Promise<UnpublishResult> {
  const repository = createListingRepository(db);

  // Bare eierens egen, aktive annonse tas ned. Andres annonser, ukjente id-er og annonser som er solgt eller tatt ned, får
  // samme svar.
  if (!(await repository.takeDownOwnActive(listingId, userId, now))) return { ok: false, error: "Annonsen finnes ikke" };

  // Ventende forespørsler avslås, så forespørreren ser svaret med én gang (Max 24.10). Å ta ned annonsen endrer ikke
  // eksisterende avtaler.
  await repository.declinePendingRequests(listingId, now);
  return { ok: true };
}
