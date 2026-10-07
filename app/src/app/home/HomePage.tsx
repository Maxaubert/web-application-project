// Forsiden: aktive annonser som kort (WF-03). Beskyttet av requireUser. Søk og filtre kommer senere.
import { LogoutButton } from "@/app/auth/LogoutButton";
import { ListingCard } from "@/app/listings/ListingCard";
import { getActiveListings } from "@/app/listings/queries";
import { PageShell } from "@/app/shared/page-shell";
import { db } from "@/db";

export async function HomePage() {
  const listings = await getActiveListings(db);

  return (
    <PageShell wide headerAction={<LogoutButton />}>
      <h1 className="text-4xl font-bold tracking-tight">Annonser</h1>
      {listings.length === 0 ? (
        <p className="mt-6 text-lg">Ingen annonser ennå.</p>
      ) : (
        <>
          <p className="mt-6 text-muted">{listings.length} {listings.length === 1 ? "annonse" : "annonser"}</p>
          <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
