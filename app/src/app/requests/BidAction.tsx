// Knappen under kategori og tilstand på annonsesiden (A til D i mockupen, #185; lån og gis bort #186). Serverkomponent,
// bare visning; ingenting her er en sikkerhetskontroll, den ligger i placeBid og placeRequest.
import type { Listing } from "@/db/schema";
import type { BidState } from "./bid-state";
import { RequestButton } from "./RequestButton";
import { formatPeriod } from "./request-view";

const button =
  "flex h-12 w-full items-center justify-center rounded-md border-2 text-lg font-semibold transition-colors";

// Det knappen heter når den kan trykkes, og når den er grået ut.
const labels = { sale: "Legg inn bud", loan: "Send låneforespørsel", giveaway: "Send forespørsel" } as const;

export function BidAction({ listingId, type, state }: { listingId: string; type: Listing["type"]; state: BidState }) {
  switch (state.kind) {
    case "none":
      return null;
    // «Administrer» der andre ser budknappen (#229, Max 24.10), også når eieren finner annonsen i søket.
    case "own":
      return (
        <a href={`/listings/${listingId}/edit`} className={`${button} border-ink bg-surface text-ink hover:bg-paper`}>
          Administrer
        </a>
      );
    case "sold":
      return (
        <button type="button" disabled className={`${button} border-hairline bg-hairline text-muted`}>
          {labels[type]}
        </button>
      );
    case "can_bid":
      return (
        <a href={`/listings/${listingId}/bid`} className={`${button} border-action bg-action text-white hover:bg-action-hover`}>
          {labels.sale}
        </a>
      );
    case "can_request":
      return type === "loan" ? (
        <a href={`/listings/${listingId}/loan`} className={`${button} border-action bg-action text-white hover:bg-action-hover`}>
          {labels.loan}
        </a>
      ) : (
        <RequestButton listingId={listingId} label={labels.giveaway} />
      );
    case "has_request":
      return (
        <a
          href={`/requests/${state.requestId}`}
          className="flex h-12 items-center rounded-md border-2 border-hairline bg-surface px-4 text-lg font-bold transition-colors hover:border-ink"
        >
          {state.startDate && state.endDate ? `Din forespørsel: ${formatPeriod(state.startDate, state.endDate)}` : "Din forespørsel sendt"}
        </a>
      );
    case "has_bid":
      return (
        <div className="space-y-3">
          <a
            href={`/requests/${state.requestId}`}
            className="flex h-12 items-center rounded-md border-2 border-hairline bg-surface px-4 text-lg font-bold transition-colors hover:border-ink"
          >
            {state.price === null ? "Ditt bud" : `Ditt bud: ${state.price.toLocaleString("nb-NO")} kr`}
          </a>
          {state.canChange && (
            <a href={`/listings/${listingId}/bid`} className={`${button} border-ink bg-surface text-ink hover:bg-paper`}>
              Endre bud
            </a>
          )}
        </div>
      );
  }
}
