// Forsiden: søk og aktive annonser som kort (WF-03). Beskyttet av requireUser.
// Søk og filtre står i adressen og valideres før databasen spørres (#97, #102). Desktop har filtrene
// i en kolonne til venstre; på mobil kommer «Filtre»-knappen rett under søket (samme rekkefølge i HTML).
import type { RequestInfo } from "rwsdk/worker";
import { LogoutButton } from "@/app/auth/LogoutButton";
import { availableOptions, matchesFilters } from "@/app/listings/filter-listings";
import { Filters } from "@/app/listings/Filters";
import { ListingCard } from "@/app/listings/ListingCard";
import { getActiveListings, type ListingWithOwner } from "@/app/listings/queries";
import { countActiveFilters, parseSearch, type ListingFilters } from "@/app/listings/search-params";
import { searchListings } from "@/app/listings/search-listings";
import { SearchField } from "@/app/listings/SearchField";
import { SearchNotice } from "@/app/listings/SearchNotice";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";

export async function HomePage({ request, response }: RequestInfo) {
  const search = parseSearch(new URL(request.url));
  if (!search.success) response.status = 400;
  // Ugyldig adresse: siden vises med tomme felt og «Ugyldig søk».
  const { q, ...filters } = search.success ? search.data : { q: "", ...NO_FILTERS };
  // Søket først, så filtrene: opsjonene som fortsatt gir treff regnes ut fra søketreffene (#122).
  const hits = search.success ? searchListings(await getActiveListings(db), q) : [];
  const listings = hits.filter(({ listing }) => matchesFilters(listing, filters));
  const available = availableOptions(
    hits.map((h) => h.listing),
    filters,
  );
  const active = countActiveFilters(filters);

  return (
    <PageShell title="Annonser" wide headerAction={<LogoutButton />}>
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10">
        <h1 className="text-4xl font-bold tracking-tight lg:col-start-2">Annonser</h1>
        <div className="lg:col-start-2">
          <SearchField q={q} />
        </div>
        <Filters q={q} filters={filters} available={available} activeCount={active} count={listings.length} />
        <div className="lg:col-start-2">
          <Results valid={search.success} searched={q !== "" || active > 0} listings={listings} />
        </div>
      </div>
    </PageShell>
  );
}

const NO_FILTERS: ListingFilters = { type: [], condition: [] };

type ResultsProps = { valid: boolean; searched: boolean; listings: ListingWithOwner[] };

function Results({ valid, searched, listings }: ResultsProps) {
  if (!valid) return <SearchNotice title="Ugyldig søk" />;
  if (listings.length === 0) {
    return searched ? <SearchNotice title="Ingen annonser passer søket" /> : <SearchNotice title="Ingen annonser ennå" showReset={false} />;
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
