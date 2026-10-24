// Én favoritt på Min side (#224, Max 24.10: rader som Forespørsler): bilde, tittel, eier og pris, type, og hjertet til
// høyre. Tittelen er en lenke strukket over hele raden; hjertet ligger over den (z-10), så det aldri er en knapp i en lenke.
import { FavoriteButton } from "@/app/favorites/FavoriteButton";
import { imageUrl } from "@/app/images/image-url";
import { formatPrice } from "@/app/listings/format-type-and-price";
import { typeLabels } from "@/app/listings/labels";
import { ListingImage } from "@/app/listings/ListingImage";
import type { ListingWithOwner } from "@/app/listings/queries";

export function FavoriteRow({ item }: { item: ListingWithOwner }) {
  const price = formatPrice(item.listing);

  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 rounded-xl border-2 border-hairline bg-surface p-3.5 transition-colors hover:border-line sm:rounded-none sm:border-0 sm:p-4 sm:hover:bg-paper">
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
        <p className="text-muted [overflow-wrap:anywhere]">
          {item.ownerName}
          {price && ` · ${price}`}
        </p>
        <p className="mt-1.5 text-sm">
          <span className="rounded-md border border-line px-2">{typeLabels[item.listing.type]}</span>
        </p>
      </div>
      <div className="relative z-10">
        <FavoriteButton listingId={item.listing.id} saved />
      </div>
    </li>
  );
}
