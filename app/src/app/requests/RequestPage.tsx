// Forespørselssiden /requests/:id (WF-08, #192). Beskyttet av requireUser. Viser status og siste bud
// for de to partene. Andre enn eieren og forespørreren får samme borte-visning med 404 som en ukjent annonse, så
// ingen kan se om en forespørsel finnes. Under budkortet har den som har tur knappene Godta, Motbud og Avslå (#187).
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
import { OfferCard, StatusBanner } from "./RequestParts";
import { bannerFor, noticeFor, offerLabel } from "./request-view";
import { ResponseActions } from "./ResponseActions";
import { Toast } from "./Toast";

const kroner = (value: number | null) => (value === null ? "–" : `${value.toLocaleString("nb-NO")} kr`);

export async function RequestPage({ params, ctx, response, request: httpRequest }: RequestInfo<{ id: string }>) {
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
  const banner = bannerFor(request.status, role, names);
  // Meldingen rett etter et svar (#203): bare når markøren i adressen stemmer med det som er lagret.
  const marker = new URL(httpRequest.url).searchParams.get("sendt");
  const notice = noticeFor(marker, request.status, latest, userId);
  const [coverKey] = await getListingImages(db, listing.id);

  return (
    <PageShell title={`Forespørsel: ${listing.title}`} wide headerAction={<HeaderActions />}>
      {notice && <Toast key={`${request.id}-${marker}`} message={notice} />}
      <div className="mx-auto max-w-3xl">
        {/* Tilbake til listen man kom fra: selgeren til Mottatt, kjøperen til Sendt (#193). Annonsen nås fra kortet under. */}
        <a href={role === "owner" ? "/me" : "/me?show=sent"} className="inline-flex min-h-11 items-center gap-1 underline hover:decoration-2">
          <span aria-hidden="true">‹</span> Min side
        </a>
        <h1 className="sr-only">Forespørsel om {listing.title}</h1>
        <div className="mt-2 space-y-4 sm:mt-6">
          <ListingSummary
            title={listing.title}
            typeAndPrice={formatTypeAndPrice(listing)}
            thumb={coverKey ? imageUrl(coverKey, "thumb") : null}
            href={`/listings/${listing.id}`}
            sellerName={role === "requester" ? details.ownerName : undefined}
          />
          <StatusBanner banner={banner} />
          {latest && (
            <OfferCard
              bidLabel={offerLabel(latest, userId, request.requesterId)}
              bid={kroner(latest.price)}
              priceLabel={role === "owner" ? "Din pris" : "Pris"}
              price={kroner(listing.price)}
            />
          )}
          {/* Knappene bare for den som har tur (#187). Godta gjelder det forslaget som vises, ikke et nyere. */}
          {latest && banner.yourTurn && <ResponseActions requestId={request.id} offerId={latest.id} />}
        </div>
      </div>
    </PageShell>
  );
}
