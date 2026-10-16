// Tilstandsmaskinen for forespørsler (FK-04 til FK-08, D-53). Her står hvem som kan flytte en
// forespørsel fra hvilken status. Serverhandlingene spør hit før de skriver, slik at en part ikke
// kan svare ut av tur eller godta et gammelt forslag.
import type { Listing, Request } from "@/db/schema";

export type RequestStatus = Request["status"];
export type Actor = "owner" | "requester" | "system";
export type RequestAction =
  | "counter"
  | "accept"
  | "decline"
  | "withdraw"
  | "cancel"
  | "expire"
  | "confirm_return";

type Transitions = Partial<Record<RequestStatus, Partial<Record<Actor, RequestStatus>>>>;

// Den som har tur, svarer på siste forslag: eieren i waiting_owner, forespørreren i waiting_requester.
const transitions: Record<RequestAction, Transitions> = {
  counter: {
    waiting_owner: { owner: "waiting_requester" },
    waiting_requester: { requester: "waiting_owner" },
  },
  accept: {
    waiting_owner: { owner: "accepted" },
    waiting_requester: { requester: "accepted" },
  },
  decline: {
    waiting_owner: { owner: "declined" },
    waiting_requester: { requester: "declined" },
  },
  // Bare forespørreren trekker tilbake, og kan gjøre det uansett hvem som har tur.
  withdraw: {
    waiting_owner: { requester: "withdrawn" },
    waiting_requester: { requester: "withdrawn" },
  },
  // Etter aksept kan begge avbestille før overlevering. Midt i et lån (in_use) kan ingen det (D-55).
  cancel: {
    accepted: { owner: "cancelled", requester: "cancelled" },
  },
  // Ubesvart etter 7 dager. Mekanismen bestemmes i #187.
  expire: {
    waiting_owner: { system: "expired" },
    waiting_requester: { system: "expired" },
  },
  // Bare eieren bekrefter retur ved lån (FK-07).
  confirm_return: {
    in_use: { owner: "completed" },
  },
};

// Neste status, eller null når handlingen ikke er lov for denne parten i denne statusen.
export function nextStatus(status: RequestStatus, action: RequestAction, actor: Actor): RequestStatus | null {
  return transitions[action][status]?.[actor] ?? null;
}

// Status etter en overleveringsbekreftelse: ventende til begge har bekreftet. Så er salg og gis bort
// fullført, og lån i bruk (D-36, D-37).
export function statusAfterHandover(
  type: Listing["type"],
  ownerConfirmed: boolean,
  requesterConfirmed: boolean,
): RequestStatus {
  if (!ownerConfirmed || !requesterConfirmed) return "accepted";
  return type === "loan" ? "in_use" : "completed";
}
