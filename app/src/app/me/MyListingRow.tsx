// Én egen annonse i Mine annonser (#229, Max 24.10: rader som de andre fanene): bilde, tittel, type og pris, statuslinje,
// og «Administrer» til høyre. Tittelen er en lenke strukket over raden, så klikk på raden åpner annonsen; «Administrer»
// ligger over den (z-10) og åpner redigeringssiden.
import { imageUrl } from "@/app/images/image-url";
import { formatTypeAndPrice } from "@/app/listings/format-type-and-price";
import { ListingImage } from "@/app/listings/ListingImage";
import { formatDay } from "@/app/requests/request-view";
import type { MyListing } from "./my-listings";

// Bare aktive annonser står i fanen, så linjen begynner alltid med «Publisert».
export function statusLine({ pending, loanedUntil }: MyListing): string {
  const parts = ["Publisert"];
  if (loanedUntil) parts.push(`utlånt til ${formatDay(loanedUntil)}`);
  if (pending > 0) parts.push(`${pending} ${pending === 1 ? "ventende forespørsel" : "ventende forespørsler"}`);
  return parts.join(" · ");
}

export function MyListingRow({ item }: { item: MyListing }) {
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-xl border-2 border-hairline bg-surface p-3.5 transition-colors hover:border-line sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:rounded-none sm:border-0 sm:p-4 sm:hover:bg-paper">
      <ListingImage
        src={item.coverKey && imageUrl(item.coverKey, "thumb")}
        className="size-20 shrink-0 rounded-lg sm:size-28 sm:rounded-xl"
        iconClassName="size-8"
      />
      <div className="min-w-0">
        <h2 className="text-lg font-bold [overflow-wrap:anywhere] sm:text-xl">
          <a href={`/listings/${item.listing.id}`} className="after:absolute after:inset-0">
            {item.listing.title}
          </a>
        </h2>
        <p className="text-muted">{formatTypeAndPrice(item.listing)}</p>
        <p className="mt-1.5 font-semibold">{statusLine(item)}</p>
      </div>
      <div className="relative z-10 col-span-2 mt-3 flex justify-end border-t border-hairline pt-3 sm:col-span-1 sm:mt-0 sm:border-0 sm:pt-0">
        <a
          href={`/listings/${item.listing.id}/edit`}
          className="inline-flex h-11 items-center rounded-md border-2 border-ink bg-surface px-4 font-semibold transition-colors hover:bg-paper"
        >
          Administrer
        </a>
      </div>
    </li>
  );
}
