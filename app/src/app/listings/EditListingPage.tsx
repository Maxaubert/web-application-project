// «Administrer» /listings/:id/edit (#229, Max 24.10): samme side og oppsett som «Legg ut annonse», fylt ut med annonsen,
// og «Slett annonse» i knapperaden. Beskyttet av requireUser. Bare eieren av en aktiv annonse får skjemaet; alle andre,
// og solgte og slettede annonser, får borte-visningen med 404, som på annonsesiden. Serverhandlingene sjekker det på nytt.
import type { RequestInfo } from "rwsdk/worker";
import { imageUrl } from "@/app/images/image-url";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";
import { DeleteListingButton } from "./DeleteListingButton";
import { ListingForm } from "./ListingForm";
import { ListingGone } from "./ListingGone";
import { getListingImages, getListingWithOwner } from "./queries";

export async function EditListingPage({ params, response, ctx }: RequestInfo<{ id: string }>) {
  const found = await getListingWithOwner(db, params.id);
  if (!found || found.listing.ownerId !== ctx.session.userId || found.listing.status !== "active") {
    response.status = 404;
    return (
      <PageShell title="Annonsen er borte" wide headerAction={<HeaderActions />}>
        <ListingGone />
      </PageShell>
    );
  }

  const { listing, ownerName } = found;
  const keys = await getListingImages(db, listing.id);
  const edit = {
    listingId: listing.id,
    values: {
      title: listing.title,
      description: listing.description,
      category: listing.category,
      type: listing.type,
      condition: listing.condition,
      price: listing.price === null ? "" : String(listing.price),
    },
    images: keys.map((key) => ({ id: key, url: imageUrl(key), thumbUrl: imageUrl(key, "thumb"), stored: true as const })),
  };

  return (
    <PageShell title="Administrer annonse" fill headerAction={<HeaderActions />}>
      <div className="flex flex-1 flex-col sm:rounded-xl sm:border sm:border-hairline sm:bg-surface sm:px-12 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-4xl">Administrer annonse</h1>
        <ListingForm ownerName={ownerName} edit={edit} extraAction={<DeleteListingButton listingId={listing.id} />} />
      </div>
    </PageShell>
  );
}
