// Hva annonsesiden viser under prisen (A til D i mockupen, #185). Én verdi i stedet for flere if-er i komponenten.
import type { Listing } from "@/db/schema";
import type { ActiveRequest } from "./queries";

export type BidState =
  | { kind: "can_bid" }
  // canChange: selgeren har ikke svart, så budet kan endres. Etter et motbud hører det til svaret i #187.
  | { kind: "has_bid"; price: number | null; canChange: boolean }
  | { kind: "own" }
  | { kind: "sold" }
  | { kind: "none" };

type BidListing = Pick<Listing, "type" | "status" | "ownerId">;

export function bidState(listing: BidListing, userId: string, active: ActiveRequest | undefined): BidState {
  // Bud finnes bare på salg. Lån og gis bort får sine egne sider (#186), og nedtatte annonser vises ikke.
  if (listing.type !== "sale" || listing.status === "unpublished") return { kind: "none" };
  // Eier først: på din egen annonse står knappen grået ut uansett.
  if (listing.ownerId === userId) return { kind: "own" };
  if (listing.status === "sold") return { kind: "sold" };
  if (active) return { kind: "has_bid", price: active.price, canChange: active.status === "waiting_owner" };
  return { kind: "can_bid" };
}
