// «Administrer»: endre en egen annonse (#229, AK-49) mot SQLite i minnet med appens migrasjoner. Godkjent av Max 24.10.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import type { ListingFormValues } from "./listing-schema";
import { updateListingFields } from "./update";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: "kari", name: "Kari Hansen", email: "kari@hiof.no" });
  await db.insert(listing).values(validListing({ id: "calc" }));
});

const changed: ListingFormValues = {
  title: "Kalkulator Casio fx-991",
  description: "Nesten ny, med deksel.",
  category: "books",
  type: "loan",
  condition: "like_new",
  price: "300",
};

const stored = async (id = "calc") => (await db.select().from(listing).where(eq(listing.id, id)))[0];

describe("updateListingFields", () => {
  it("lagrer eierens endringer, men handelstypen er låst selv om skjemaet sender en annen", async () => {
    expect(await updateListingFields(db, { userId: OWNER_ID, listingId: "calc", values: changed })).toEqual({ ok: true });

    const row = await stored();
    expect(row).toMatchObject({
      title: "Kalkulator Casio fx-991",
      description: "Nesten ny, med deksel.",
      category: "books",
      condition: "like_new",
      price: 300,
      type: "sale",
    });
  });

  it("gir feltfeil for ugyldige verdier og endrer ingenting", async () => {
    const before = await stored();
    const result = await updateListingFields(db, { userId: OWNER_ID, listingId: "calc", values: { ...changed, title: "Ka", price: "100001" } });

    expect(result.ok).toBe(false);
    expect("fieldErrors" in result && Object.keys(result.fieldErrors).sort()).toEqual(["price", "title"]);
    expect(await stored()).toEqual(before);
  });

  it("avviser en annen bruker uten å endre noe (TK-03)", async () => {
    const before = await stored();
    expect((await updateListingFields(db, { userId: "kari", listingId: "calc", values: changed })).ok).toBe(false);
    expect(await stored()).toEqual(before);
  });

  it("avviser solgte og nedtatte annonser", async () => {
    await db.insert(listing).values([validListing({ id: "sold", status: "sold" }), validListing({ id: "down", status: "unpublished" })]);
    expect((await updateListingFields(db, { userId: OWNER_ID, listingId: "sold", values: changed })).ok).toBe(false);
    expect((await updateListingFields(db, { userId: OWNER_ID, listingId: "down", values: changed })).ok).toBe(false);
    expect((await stored("sold"))?.title).toBe("Kalkulator");
    expect((await stored("down"))?.title).toBe("Kalkulator");
  });

  it("lar eksisterende bud og en godtatt avtale beholde sine vilkår når prisen endres (D-51)", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", status: "accepted" });
    await db.insert(offer).values({ id: "o1", requestId: "r1", senderId: "kari", price: 220 });

    await updateListingFields(db, { userId: OWNER_ID, listingId: "calc", values: changed });

    expect((await db.select().from(request).where(eq(request.id, "r1")))[0]?.status).toBe("accepted");
    expect((await db.select().from(offer).where(eq(offer.id, "o1")))[0]?.price).toBe(220);
  });
});
