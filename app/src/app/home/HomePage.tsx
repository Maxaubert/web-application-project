// Forsiden: søk og aktive annonser som kort (WF-03). Beskyttet av requireUser.
// Søket står i adressen (?q=) og valideres før databasen spørres (#97). Filtre kommer i #102.
import type { RequestInfo } from "rwsdk/worker";
import { LogoutButton } from "@/app/auth/LogoutButton";
import { ListingCard } from "@/app/listings/ListingCard";
import { getActiveListings, type ListingWithOwner } from "@/app/listings/queries";
import { parseSearch } from "@/app/listings/search-params";
import { searchListings } from "@/app/listings/search-listings";
import { SearchField } from "@/app/listings/SearchField";
import { SearchNotice } from "@/app/listings/SearchNotice";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";

export async function HomePage({ request, response }: RequestInfo) {
  const search = parseSearch(new URL(request.url));
  if (!search.success) response.status = 400;
  const q = search.success ? search.data.q : "";
  const listings = search.success ? searchListings(await getActiveListings(db), q) : [];

  return (
    <PageShell wide headerAction={<LogoutButton />}>
      <h1 className="text-4xl font-bold tracking-tight">Annonser</h1>
      <SearchField q={q} />
      <Results valid={search.success} q={q} listings={listings} />
    </PageShell>
  );
}

type ResultsProps = { valid: boolean; q: string; listings: ListingWithOwner[] };

function Results({ valid, q, listings }: ResultsProps) {
  if (!valid) return <SearchNotice title="Ugyldig søk" />;
  if (listings.length === 0) {
    return q ? <SearchNotice title="Ingen annonser passer søket" /> : <p className="mt-6 text-lg">Ingen annonser ennå.</p>;
  }
  return (
    <>
      <p className="mt-6 text-muted">
        {listings.length} {listings.length === 1 ? "annonse" : "annonser"}
      </p>
      <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map(({ listing }) => (
          <li key={listing.id}>
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </>
  );
}
