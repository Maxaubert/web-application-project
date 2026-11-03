// Favoritt på og av (FK-14, #224). Reglene: vet ingenting om økt eller nettforespørsel, og snakker med databasen bare
// gjennom repositoryet (#256). Serverhandlingen toggleFavorite i actions.ts henter brukeren fra økten og kaller hit.
// All autorisasjon ligger her.
import type { Db } from "@/db/types";
import { createFavoriteRepository } from "./repository";

type FavoriteInput = { userId: string; listingId: string; on: boolean };
export type FavoriteResult = { ok: true } | { ok: false; error: string };

const NOT_FOUND = "Annonsen finnes ikke";
const OWN = "Du kan ikke lagre din egen annonse som favoritt";

export async function setFavorite(db: Db, { userId, listingId, on }: FavoriteInput): Promise<FavoriteResult> {
  const repository = createFavoriteRepository(db);

  // Av sletter bare brukerens egen rad, også når annonsen er solgt eller tatt ned i mellomtiden.
  if (!on) {
    await repository.remove(userId, listingId);
    return { ok: true };
  }

  // Solgte og nedtatte annonser kan ikke lagres; de får samme svar som en ukjent id.
  const ad = await repository.findListing(listingId);
  if (!ad || ad.status !== "active") return { ok: false, error: NOT_FOUND };
  if (ad.ownerId === userId) return { ok: false, error: OWN };

  await repository.add(userId, listingId);
  return { ok: true };
}
