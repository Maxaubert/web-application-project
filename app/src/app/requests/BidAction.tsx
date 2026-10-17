// Knappen under kategori og tilstand på annonsesiden (A til D i mockupen, #185). Serverkomponent, bare visning;
// ingenting her er en sikkerhetskontroll, den ligger i placeBid.
import type { BidState } from "./bid-state";

const button =
  "flex h-12 w-full items-center justify-center rounded-md border-2 text-lg font-semibold transition-colors";

export function BidAction({ listingId, state }: { listingId: string; state: BidState }) {
  switch (state.kind) {
    case "none":
      return null;
    case "own":
    case "sold":
      return (
        <button type="button" disabled className={`${button} border-hairline bg-hairline text-muted`}>
          Legg inn bud
        </button>
      );
    case "can_bid":
      return (
        <a href={`/listings/${listingId}/bid`} className={`${button} border-action bg-action text-white hover:bg-action-hover`}>
          Legg inn bud
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
