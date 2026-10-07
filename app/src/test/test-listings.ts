// Testdata for annonser: en eier og en gyldig annonse som hver test kan endre på.
import { listing, user } from "@/db/schema";
import type { Db } from "@/db/types";

export const OWNER_ID = "owner-1";

type NewListing = typeof listing.$inferInsert;

export async function insertOwner(db: Db, id = OWNER_ID) {
  await db.insert(user).values({ id, name: "Ola Nordmann", email: `${id}@hiof.no` });
}

export function validListing(overrides: Partial<NewListing> = {}): NewListing {
  return {
    ownerId: OWNER_ID,
    type: "sale",
    title: "Kalkulator",
    description: "Lite brukt.",
    category: "electronics",
    condition: "used",
    price: 250,
    ...overrides,
  };
}
