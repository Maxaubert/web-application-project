// Forespørselssiden /requests/:id (WF-08, #192). Beskyttet av requireUser. Bare visning: status, siste bud og historikk
// for de to partene. Andre enn eieren og forespørreren får samme borte-visning med 404 som en ukjent annonse, så
// ingen kan se om en forespørsel finnes. Handlingsknappene kommer under budkortet med #187.
// Tilbakelenken går til Min side (#193) og annonsekortet til annonsen.
import type { RequestInfo } from "rwsdk/worker";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";
import { imageUrl } from "@/app/images/image-url";
import { formatTypeAndPrice } from "@/app/listings/format-type-and-price";
import { ListingGone } from "@/app/listings/ListingGone";
import { getListingImages } from "@/app/listings/queries";
import { ListingSummary } from "./ListingSummary";
import { getRequestForParty } from "./queries";
import { History, OfferCard, StatusBanner } from "./RequestParts";
import { bannerFor, historyLine, offerLabel } from "./request-view";

const kroner = (value: number | null) => (value === null ? "–" : `${value.toLocaleString("nb-NO")} kr`);

export async function RequestPage({ params, ctx, response }: RequestInfo<{ id: string }>) {
  const userId = ctx.session.userId ?? "";
  const details = await getRequestForParty(db, params.id, userId);

  if (!details) {
    response.status = 404;
    return (
      <PageShell title="Annonsen er borte" wide headerAction={<HeaderActions />}>
        <ListingGone />
      </PageShell>
    );
  }

  const { request, listing, offers, role } = details;
  const names = { ownerName: details.ownerName, requesterName: details.requesterName };
  const latest = offers[offers.length - 1];
  const [coverKey] = await getListingImages(db, listing.id);
  // Nyeste først i historikken.
  const lines = offers.map((o) => historyLine(o, userId, request.requesterId, names)).reverse();

  return (
    <PageShell title={`Forespørsel: ${listing.title}`} wide headerAction={<HeaderActions />}>
      {/* Tilbake til listen man kom fra: selgeren til Mottatt, kjøperen til Sendt (#193). Annonsen nås fra kortet under. */}
      <a href={role === "owner" ? "/me" : "/me?show=sent"} className="inline-flex min-h-11 items-center gap-1 underline hover:decoration-2">
        <span aria-hidden="true">‹</span> Min side
      </a>
      <h1 className="sr-only">Forespørsel om {listing.title}</h1>
      <div className="mt-2 grid grid-cols-1 gap-6 sm:mt-6 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-12">
        <div className="space-y-4">
          <ListingSummary
            title={listing.title}
            typeAndPrice={formatTypeAndPrice(listing)}
            thumb={coverKey ? imageUrl(coverKey, "thumb") : null}
            href={`/listings/${listing.id}`}
            sellerName={role === "requester" ? details.ownerName : undefined}
          />
          <StatusBanner banner={bannerFor(request.status, role, names)} />
          {latest && (
            <OfferCard
              bidLabel={offerLabel(latest, userId, request.requesterId)}
              bid={kroner(latest.price)}
              priceLabel={role === "owner" ? "Din pris" : "Pris"}
              price={kroner(listing.price)}
            />
          )}
        </div>
        <History lines={lines} />
      </div>
    </PageShell>
  );
}
