// Annonsesiden /listings/:id (WF-04). Beskyttet av requireUser. Henter annonsen og velger visning:
// aktiv og solgt vises (solgt med merke), nedtatt og ukjent gir samme borte-visning med 404.
import type { RequestInfo } from "rwsdk/worker";
import { LogoutButton } from "@/app/auth/LogoutButton";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";
import { ListingDetails } from "./ListingDetails";
import { ListingGone } from "./ListingGone";
import { getListingWithOwner } from "./queries";

export async function ListingPage({ params, response }: RequestInfo<{ id: string }>) {
  const result = await getListingWithOwner(db, params.id);
  const visible = result && result.listing.status !== "unpublished";

  if (!visible) response.status = 404;

  return (
    <PageShell title={visible ? result.listing.title : "Annonsen er borte"} wide headerAction={<LogoutButton />}>
      {visible ? <ListingDetails listing={result.listing} ownerName={result.ownerName} /> : <ListingGone />}
    </PageShell>
  );
}
