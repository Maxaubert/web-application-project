// Lånesiden /listings/:id/loan (WF-06 for lån, #186). Beskyttet av requireUser. Som budsiden: ukjent, nedtatt eller en
// annen handelstype gir samme borte-visning med 404 som annonsesiden, og egen annonse eller en forespørsel som
// allerede er sendt sendes tilbake til annonsen. Selve kontrollen skjer på nytt i placeRequest.
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
import { LoanForm } from "./LoanForm";
import { getOccupiedPeriods } from "./occupied";
import { getActiveRequest } from "./queries";

export async function LoanPage({ params, ctx, response }: RequestInfo<{ id: string }>) {
  const result = await getListingWithOwner(db, params.id);
  const found = result?.listing;

  if (!found || found.status === "unpublished" || found.type !== "loan") {
    response.status = 404;
    return (
      <PageShell title="Annonsen er borte" wide headerAction={<HeaderActions />}>
        <ListingGone />
      </PageShell>
    );
  }

  const userId = ctx.session.userId ?? "";
  const state = bidState(found, userId, await getActiveRequest(db, found.id, userId));
  if (state.kind !== "can_request") return redirectTo(`/listings/${found.id}`);

  const [coverKey] = await getListingImages(db, found.id);

  return (
    <PageShell title="Send låneforespørsel" wide headerAction={<HeaderActions />}>
      <div className="mx-auto max-w-3xl">
        <a href={`/listings/${found.id}`} className="inline-flex min-h-11 items-center gap-1 underline hover:decoration-2">
          <span aria-hidden="true">‹</span> Tilbake til annonsen
        </a>
        <h1 className="mt-2 mb-6 text-2xl font-bold tracking-tight sm:text-4xl">Send låneforespørsel</h1>
        <LoanForm
          listingId={found.id}
          title={found.title}
          typeAndPrice={formatTypeAndPrice(found)}
          ownerName={result.ownerName}
          thumb={coverKey ? imageUrl(coverKey, "thumb") : null}
          weeklyPrice={found.price}
          occupied={await getOccupiedPeriods(db, found.id)}
        />
      </div>
    </PageShell>
  );
}
