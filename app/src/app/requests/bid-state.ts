// Hva annonsesiden viser som knapp (A til D i mockupen, #185; lån og gis bort #186). Én verdi i stedet for flere if-er i komponenten.
import type { Listing } from "@/db/schema";
import type { ActiveRequest } from "./queries";

export type BidState =
  | { kind: "can_bid" }
  // canChange: selgeren har ikke svart, så budet kan endres. Etter et motbud hører det til svaret i #187.
  | { kind: "has_bid"; requestId: string; price: number | null; canChange: boolean }
  // Lån og gis bort (#186): kan sendes, eller er sendt. Perioden er med for lån; en sendt forespørsel kan ikke endres.
  | { kind: "can_request" }
  | { kind: "has_request"; requestId: string; startDate: string | null; endDate: string | null }
  | { kind: "own" }
  | { kind: "sold" }
  | { kind: "none" };

type BidListing = Pick<Listing, "type" | "status" | "ownerId">;

export function bidState(listing: BidListing, userId: string, active: ActiveRequest | undefined): BidState {
  // Nedtatte annonser vises ikke.
  if (listing.status === "unpublished") return { kind: "none" };
  // Eier først: på din egen annonse står knappen grået ut uansett.
  // Eieren får «Administrer» (#229), men bare så lenge annonsen er aktiv; en solgt annonse kan ikke endres.
  if (listing.ownerId === userId) return listing.status === "sold" ? { kind: "sold" } : { kind: "own" };
  if (listing.status === "sold") return { kind: "sold" };
  if (listing.type !== "sale") {
    if (active) return { kind: "has_request", requestId: active.id, startDate: active.startDate, endDate: active.endDate };
    return { kind: "can_request" };
  }
  if (active) return { kind: "has_bid", requestId: active.id, price: active.price, canChange: active.status === "waiting_owner" };
  return { kind: "can_bid" };
}
