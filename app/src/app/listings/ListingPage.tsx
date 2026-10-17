// Annonsesiden /listings/:id (WF-04). Beskyttet av requireUser. Henter annonsen og velger visning:
// aktiv og solgt vises (solgt med merke), nedtatt og ukjent gir samme borte-visning med 404.
// Rett etter publisering (?publisert=1) ser eieren en bekreftelse øverst (#133); andre ser den ikke.
import type { RequestInfo } from "rwsdk/worker";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";
import { ListingDetails } from "./ListingDetails";
import { ListingGone } from "./ListingGone";
import { imageUrl } from "@/app/images/image-url";
import { getListingImages, getListingWithOwner } from "./queries";
import { bidState } from "@/app/requests/bid-state";
import { BidAction } from "@/app/requests/BidAction";
import { getActiveRequest } from "@/app/requests/queries";

export async function ListingPage({ params, request, response, ctx }: RequestInfo<{ id: string }>) {
  const result = await getListingWithOwner(db, params.id);
  const visible = result && result.listing.status !== "unpublished";

  if (!visible) response.status = 404;
  const images = visible ? (await getListingImages(db, params.id)).map((key) => ({ src: imageUrl(key), thumb: imageUrl(key, "thumb") })) : [];
  const published =
    visible && new URL(request.url).searchParams.get("publisert") === "1" && result.listing.ownerId === ctx.session.userId;

  // Budknappen (#185). Bare for synlige annonser; ukjente og nedtatte har ingen.
  const userId = ctx.session.userId ?? "";
  const bid = visible ? bidState(result.listing, userId, await getActiveRequest(db, params.id, userId)) : ({ kind: "none" } as const);

  return (
    <PageShell title={visible ? result.listing.title : "Annonsen er borte"} wide headerAction={<HeaderActions />}>
      {published && <PublishedNotice />}
      {visible ? (
        <ListingDetails
          listing={result.listing}
          ownerName={result.ownerName}
          images={images}
          bidAction={<BidAction listingId={params.id} state={bid} />}
        />
      ) : (
        <ListingGone />
      )}
    </PageShell>
  );
}

// role="status": skjermlesere leser bekreftelsen opp uten å flytte fokus.
function PublishedNotice() {
  return (
    <p role="status" className="mb-6 flex items-center gap-3 rounded-lg border-2 border-ink bg-surface px-5 py-4 text-lg font-semibold">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 fill-none stroke-ink stroke-[2.4]">
        <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Annonsen er publisert og synlig i søket.
    </p>
  );
}
