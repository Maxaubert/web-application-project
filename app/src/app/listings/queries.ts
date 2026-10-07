// Databasespørringer for annonser. Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { desc, eq } from "drizzle-orm";
import { listing, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";

// Aktive annonser til forsiden, nyeste først (WF-03). Solgte og nedtatte vises ikke.
export function getActiveListings(db: Db): Promise<Listing[]> {
  return db.select().from(listing).where(eq(listing.status, "active")).orderBy(desc(listing.createdAt));
}
