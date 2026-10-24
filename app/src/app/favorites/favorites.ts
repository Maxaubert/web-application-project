// Favoritt på og av (FK-14, #224). Tar databasen som argument og vet ingenting om økt eller nettforespørsel;
// serverhandlingen toggleFavorite i actions.ts henter brukeren fra økten og kaller hit. All autorisasjon ligger her.
import { and, eq } from "drizzle-orm";
import { favorite, listing } from "@/db/schema";
import type { Db } from "@/db/types";

type FavoriteInput = { userId: string; listingId: string; on: boolean };
export type FavoriteResult = { ok: true } | { ok: false; error: string };

const NOT_FOUND = "Annonsen finnes ikke";
const OWN = "Du kan ikke lagre din egen annonse som favoritt";

export async function setFavorite(db: Db, { userId, listingId, on }: FavoriteInput): Promise<FavoriteResult> {
  // Av sletter bare brukerens egen rad, også når annonsen er solgt eller tatt ned i mellomtiden.
  if (!on) {
    await db.delete(favorite).where(and(eq(favorite.userId, userId), eq(favorite.listingId, listingId)));
    return { ok: true };
  }

  // Solgte og nedtatte annonser kan ikke lagres; de får samme svar som en ukjent id.
  const rows = await db.select({ ownerId: listing.ownerId, status: listing.status }).from(listing).where(eq(listing.id, listingId)).limit(1);
  const ad = rows[0];
  if (!ad || ad.status !== "active") return { ok: false, error: NOT_FOUND };
  if (ad.ownerId === userId) return { ok: false, error: OWN };

  // To trykk, eller to faner samtidig, gir fortsatt én rad: nøkkelen er paret.
  await db.insert(favorite).values({ userId, listingId }).onConflictDoNothing();
  return { ok: true };
}
