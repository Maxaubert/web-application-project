// Favoritter (FK-14, #224, AK-42 til AK-45) mot SQLite i minnet med appens migrasjoner.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { favorite, listing, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { setFavorite } from "./favorites";
import { getFavoriteIds, getFavoriteListings } from "./queries";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values(validListing({ id: "calc" }));
});

const rowsFor = (userId: string) => db.select().from(favorite).where(eq(favorite.userId, userId));
const listedIds = async (userId: string) => (await getFavoriteListings(db, userId)).map((row) => row.listing.id);

describe("setFavorite", () => {
  it("lagrer en annen students aktive annonse, og den vises i Mine favoritter (AK-42)", async () => {
    expect(await setFavorite(db, { userId: "kari", listingId: "calc", on: true })).toEqual({ ok: true });
    expect(await listedIds("kari")).toEqual(["calc"]);
    expect(await getFavoriteIds(db, "kari")).toEqual(new Set(["calc"]));
  });

  it("avviser egen annonse uten å lagre noe (AK-44)", async () => {
    const result = await setFavorite(db, { userId: OWNER_ID, listingId: "calc", on: true });
    expect(result.ok).toBe(false);
    expect(await rowsFor(OWNER_ID)).toEqual([]);
  });

  it("avviser solgte og nedtatte annonser uten å lagre noe", async () => {
    await db.insert(listing).values([validListing({ id: "sold", status: "sold" }), validListing({ id: "down", status: "unpublished" })]);
    expect((await setFavorite(db, { userId: "kari", listingId: "sold", on: true })).ok).toBe(false);
    expect((await setFavorite(db, { userId: "kari", listingId: "down", on: true })).ok).toBe(false);
    expect(await rowsFor("kari")).toEqual([]);
  });

  it("gir én rad når samme annonse lagres to ganger", async () => {
    await setFavorite(db, { userId: "kari", listingId: "calc", on: true });
    await setFavorite(db, { userId: "kari", listingId: "calc", on: true });
    expect(await rowsFor("kari")).toHaveLength(1);
  });

  it("fjerner bare brukerens egen rad, og hver bruker ser bare sine favoritter (AK-45)", async () => {
    await setFavorite(db, { userId: "kari", listingId: "calc", on: true });
    expect(await listedIds("per")).toEqual([]);

    await setFavorite(db, { userId: "per", listingId: "calc", on: false });
    expect(await listedIds("kari")).toEqual(["calc"]);

    await setFavorite(db, { userId: "kari", listingId: "calc", on: false });
    expect(await listedIds("kari")).toEqual([]);
  });
});

describe("getFavoriteListings", () => {
  it("skjuler en annonse som blir solgt, og viser den igjen når den legges ut på nytt (AK-43)", async () => {
    await setFavorite(db, { userId: "kari", listingId: "calc", on: true });

    await db.update(listing).set({ status: "sold" }).where(eq(listing.id, "calc"));
    expect(await listedIds("kari")).toEqual([]);
    // Raden er ikke slettet, bare skjult.
    expect(await rowsFor("kari")).toHaveLength(1);

    await db.update(listing).set({ status: "active" }).where(eq(listing.id, "calc"));
    expect(await listedIds("kari")).toEqual(["calc"]);
  });

  it("viser fortsatt et lån som er utlånt (AK-43)", async () => {
    await db.insert(listing).values(validListing({ id: "drill", type: "loan", price: null }));
    await setFavorite(db, { userId: "kari", listingId: "drill", on: true });
    await db.insert(request).values({ listingId: "drill", requesterId: "per", status: "in_use" });

    expect(await listedIds("kari")).toEqual(["drill"]);
  });
});
