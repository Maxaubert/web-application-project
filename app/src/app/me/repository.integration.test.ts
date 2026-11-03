// Profilen i Min side-repositoryet (#193, #256) mot SQLite i minnet: hentes for den innloggede, uten andre kolonner.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, user } from "@/db/schema";
import { validListing } from "@/test/test-listings";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { createMeRepository } from "./repository";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4791234567" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
});

describe("findProfile", () => {
  it("gir navn, e-post og telefon for brukeren", async () => {
    expect(await createMeRepository(db).findProfile("kari")).toEqual({ name: "Kari Hansen", email: "kari@hiof.no", phone: "+4791234567" });
  });

  it("gir telefon null når kontooppsettet ikke har den", async () => {
    expect(await createMeRepository(db).findProfile("per")).toEqual({ name: "Per Olsen", email: "per@hiof.no", phone: null });
  });

  it("gir undefined for en ukjent eller tom id, og aldri en annen brukers rad", async () => {
    expect(await createMeRepository(db).findProfile("finnes-ikke")).toBeUndefined();
    expect(await createMeRepository(db).findProfile("")).toBeUndefined();
  });
});

// Repositoryet (#256): bare forespørsler på egne annonser, uansett hvem som spurte. Godkjent av Max 03.11.
describe("findRequestsOnOwnListings", () => {
  it("gir forespørslene på brukerens egne annonser og ingen andre", async () => {
    await db.insert(listing).values([validListing({ id: "mine", ownerId: "kari" }), validListing({ id: "pers", ownerId: "per" })]);
    await db.insert(request).values([
      { id: "r1", listingId: "mine", requesterId: "per" },
      { id: "r2", listingId: "pers", requesterId: "kari" },
    ]);

    const found = await createMeRepository(db).findRequestsOnOwnListings("kari");
    expect(found.map((r) => r.id)).toEqual(["r1"]);
  });
});
