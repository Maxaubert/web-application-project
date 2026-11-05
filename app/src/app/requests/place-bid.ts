// Budet på salg (FK-04). Reglene ligger i placeRequest; her står bare at budsiden og sendBid gjelder salg alene,
// slik at et bud aldri kan lande på en låne- eller gis bort-annonse.
import type { Db } from "@/db/types";
import { placeRequest, type PlaceRequestResult } from "./place-request";
import { createRequestRepository } from "./repository";

type PlaceBidInput = { userId: string; listingId: string; price: string; now?: Date };
export type PlaceBidResult = PlaceRequestResult;

export async function placeBid(db: Db, { userId, listingId, price, now }: PlaceBidInput): Promise<PlaceBidResult> {
  const found = await createRequestRepository(db).findListing(listingId);
  if (found && found.type !== "sale") return { ok: false, error: "Du kan ikke legge inn bud på denne annonsen" };
  return placeRequest(db, { userId, listingId, price, now });
}
