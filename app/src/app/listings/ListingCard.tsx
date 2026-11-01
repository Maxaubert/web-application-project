// Kort for én annonse i søket, på Min side og i forhåndsvisningen (WF-03, docs/app/komponenter.md).
// Serverkomponent: bare visning, ingen tilstand. Hele kortet er en lenke til annonsesiden (WF-04).
// Hjertet (#224) står ved siden av lenken, ikke inni den, så det aldri blir en knapp inne i en lenke.
import type { Listing } from "@/db/schema";
import { FavoriteButton } from "@/app/favorites/FavoriteButton";
import { formatTypeAndPrice } from "./format-type-and-price";
import { ListingImage } from "./ListingImage";

// cover: adressen til forsidebildet, eller null for plassholderen (#150).
// favorite: om brukeren har lagret annonsen. Uten den er det ikke noe hjerte (egne annonser, forhåndsvisningen).
type ListingCardProps = { listing: Listing; cover: string | null; favorite?: boolean };

export function ListingCard({ listing, cover, favorite }: ListingCardProps) {
  return (
    <article className="@container relative overflow-hidden rounded-xl border border-hairline bg-surface transition-colors hover:border-line">
      {/* Fokusrammen tegnes innenfor kortet, ellers klipper overflow-hidden den bort (#113). */}
      <a href={`/listings/${listing.id}`} className="block rounded-xl focus-visible:-outline-offset-4">
        <ListingImage src={cover} className="aspect-[4/3] w-full" />
        <div className="px-4 py-3">
          <h2 className="line-clamp-2 text-lg font-bold [overflow-wrap:anywhere]">{listing.title}</h2>
          <p className="mt-1 font-semibold">{formatTypeAndPrice(listing)}</p>
        </div>
      </a>
      {favorite !== undefined && (
        // Nederst til høyre i bildet (Max 24.10). Bildet er 4:3 av kortets bredde (@container), så toppen regnes fra bredden.
        <div className="absolute top-[calc(75cqw-3.25rem)] right-2">
          <FavoriteButton listingId={listing.id} saved={favorite} />
        </div>
      )}
    </article>
  );
}
