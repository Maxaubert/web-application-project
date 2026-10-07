// Kort for én annonse i søket, på Min side og i forhåndsvisningen (WF-03, docs/app/komponenter.md).
// Serverkomponent: bare visning, ingen tilstand. Lenken til annonsesiden kommer med den siden.
import type { Listing } from "@/db/schema";
import { formatTypeAndPrice } from "./format-type-and-price";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-surface">
      {/* Plassholder til bildene kommer (#61), så kortet allerede har sin endelige form. */}
      <div aria-hidden="true" className="flex aspect-[4/3] items-center justify-center bg-hairline/60">
        <svg viewBox="0 0 24 24" className="size-10 fill-none stroke-muted stroke-[1.5]">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 17-5-5-9 8" />
        </svg>
      </div>
      <div className="px-4 py-3">
        <h2 className="text-lg font-bold">{listing.title}</h2>
        <p className="mt-1 font-semibold">{formatTypeAndPrice(listing)}</p>
      </div>
    </article>
  );
}
