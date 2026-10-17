// Budsiden /listings/:id/bid (WF-06, #185). Beskyttet av requireUser. Siden viser skjemaet bare når et bud er lov:
// ukjent, nedtatt eller en annen handelstype gir samme borte-visning med 404 som annonsesiden, og egen eller solgt
// annonse sendes tilbake til annonsen. Selve kontrollen skjer på nytt i placeBid.
import type { RequestInfo } from "rwsdk/worker";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { redirectTo } from "@/app/auth/guards";
import { db } from "@/db";
import { imageUrl } from "@/app/images/image-url";
import { formatTypeAndPrice } from "@/app/listings/format-type-and-price";
import { ListingGone } from "@/app/listings/ListingGone";
import { getListingImages, getListingWithOwner } from "@/app/listings/queries";
import { bidState } from "./bid-state";
import { BidForm } from "./BidForm";
import { getActiveRequest } from "./queries";

export async function BidPage({ params, ctx, response }: RequestInfo<{ id: string }>) {
  const result = await getListingWithOwner(db, params.id);
  const found = result?.listing;

  if (!found || found.status === "unpublished" || found.type !== "sale") {
    response.status = 404;
    return (
      <PageShell title="Annonsen er borte" wide headerAction={<HeaderActions />}>
        <ListingGone />
      </PageShell>
    );
  }

  const userId = ctx.session.userId ?? "";
  const active = await getActiveRequest(db, found.id, userId);
  const state = bidState(found, userId, active);
  const canBid = state.kind === "can_bid" || (state.kind === "has_bid" && state.canChange);
  if (!canBid) return redirectTo(`/listings/${found.id}`);

  const [coverKey] = await getListingImages(db, found.id);
  const editing = state.kind === "has_bid";

  return (
    <PageShell title={editing ? "Endre bud" : "Legg inn bud"} wide headerAction={<HeaderActions />}>
      <div className="mx-auto max-w-3xl">
        <a href={`/listings/${found.id}`} className="inline-flex min-h-11 items-center gap-1 underline hover:decoration-2">
          <span aria-hidden="true">‹</span> Tilbake til annonsen
        </a>
        <h1 className="mt-2 mb-6 text-2xl font-bold tracking-tight sm:text-4xl">{editing ? "Endre bud" : "Legg inn bud"}</h1>
        <BidForm
          listingId={found.id}
          title={found.title}
          typeAndPrice={formatTypeAndPrice(found)}
          ownerName={result.ownerName}
          thumb={coverKey ? imageUrl(coverKey, "thumb") : null}
          initialPrice={state.kind === "has_bid" && state.price !== null ? String(state.price) : ""}
        />
      </div>
    </PageShell>
  );
}
