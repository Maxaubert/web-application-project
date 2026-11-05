// Kort for én annonse i søket, på Min side og i forhåndsvisningen (WF-03, docs/app/komponenter.md).
// Serverkomponent: bare visning, ingen tilstand. Hele kortet er en lenke til annonsesiden (WF-04).
// Hjertet (#224) står ved siden av lenken, ikke inni den, så det aldri blir en knapp inne i en lenke.
import type { Listing } from "@/db/schema";
import { FavoriteButton } from "@/app/favorites/FavoriteButton";
import { formatPrice } from "./format-type-and-price";
import { typeLabels } from "./labels";
import { ListingImage } from "./ListingImage";

// Handelstypen som merke på bildet (Torget, #289), med en egen farge per type.
const tagClass: Record<Listing["type"], string> = {
  sale: "bg-mint-hover text-mint-ink",
  loan: "bg-loan text-plum",
  giveaway: "bg-gift text-gift-ink",
};

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
          <h2 className="line-clamp-2 min-h-14 text-lg font-bold [overflow-wrap:anywhere]">{listing.title}</h2>
          <p className="mt-1 text-xl font-extrabold">{formatPrice(listing) ?? "Gratis"}</p>
        </div>
      </a>
      <span className={`pointer-events-none absolute top-2 left-2 rounded-md px-2.5 py-0.5 font-bold ${tagClass[listing.type]}`}>{typeLabels[listing.type]}</span>
      {favorite !== undefined && (
        // Nederst til høyre i bildet (Max 24.10). Bildet er 4:3 av kortets bredde (@container), så toppen regnes fra bredden.
        <div className="absolute top-[calc(75cqw-3.25rem)] right-2">
          <FavoriteButton listingId={listing.id} saved={favorite} />
        </div>
      )}
    </article>
  );
}
