// Databasespørringer for annonser. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { desc, eq } from "drizzle-orm";
import { listing, user, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";

export type ListingWithOwner = { listing: Listing; ownerName: string };

// Aktive annonser til forsiden, nyeste først (WF-03). Solgte og nedtatte vises ikke.
export function getActiveListings(db: Db): Promise<Listing[]> {
  return db.select().from(listing).where(eq(listing.status, "active")).orderBy(desc(listing.createdAt));
}

// Én annonse med eierens navn til annonsesiden (WF-04), uansett status; siden avgjør hva som vises.
// Bare navnet hentes fra brukeren, så telefon og e-post aldri kan havne på siden.
export async function getListingWithOwner(db: Db, id: string): Promise<ListingWithOwner | undefined> {
  const rows = await db
    .select({ listing, ownerName: user.name })
    .from(listing)
    .innerJoin(user, eq(listing.ownerId, user.id))
    .where(eq(listing.id, id))
    .limit(1);
  return rows[0];
}
