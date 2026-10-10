// Kort for én annonse i søket, på Min side og i forhåndsvisningen (WF-03, docs/app/komponenter.md).
// Serverkomponent: bare visning, ingen tilstand. Hele kortet er en lenke til annonsesiden (WF-04).
import type { Listing } from "@/db/schema";
import { formatTypeAndPrice } from "./format-type-and-price";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-surface transition-colors hover:border-line">
      {/* Fokusrammen tegnes innenfor kortet, ellers klipper overflow-hidden den bort (#113). */}
      <a href={`/listings/${listing.id}`} className="block rounded-xl focus-visible:-outline-offset-4">
        <ImagePlaceholder className="aspect-[4/3]" />
        <div className="px-4 py-3">
          <h2 className="line-clamp-2 text-lg font-bold [overflow-wrap:anywhere]">{listing.title}</h2>
          <p className="mt-1 font-semibold">{formatTypeAndPrice(listing)}</p>
        </div>
      </a>
    </article>
  );
}
