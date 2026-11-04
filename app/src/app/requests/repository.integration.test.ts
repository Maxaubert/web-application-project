// Forespørsel-repositoryet (#256) mot SQLite i minnet: de betingede skrivingene er det som hindrer to samtidige svar i å
// begge lykkes, så de testes direkte. Godkjent av Max 03.11.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, validListing } from "@/test/test-listings";
import { createRequestRepository } from "./repository";

let db: Db;
const now = new Date("2026-11-03T12:00:00Z");

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: "kari", name: "Kari Hansen", email: "kari@hiof.no" });
  await db.insert(listing).values(validListing({ id: "calc" }));
  await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
});

describe("createRequestRepository", () => {
  it("flytter statusen bare én gang: det andre av to like kall taper", async () => {
    const repository = createRequestRepository(db);

    expect(await repository.moveStatus("r1", "waiting_owner", "accepted", now)).toBe(true);
    expect(await repository.moveStatus("r1", "waiting_owner", "declined", now)).toBe(false);
    expect((await db.select().from(request))[0].status).toBe("accepted");
  });

  it("tar annonsen bare én gang, og legger ut igjen bare en solgt annonse", async () => {
    const repository = createRequestRepository(db);

    expect(await repository.markListingSold("calc", now)).toBe(true);
    expect(await repository.markListingSold("calc", now)).toBe(false);
    await repository.relistIfSold("calc", now);
    expect((await repository.findListing("calc"))?.status).toBe("active");
  });
});
