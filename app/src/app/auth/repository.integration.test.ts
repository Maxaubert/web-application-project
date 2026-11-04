// Innloggingens repository (#256) mot SQLite i minnet: kontooppsettet endrer bare den ene brukerens rad, og kodegrensen
// finner bare kodene for samme adresse. Godkjent av Max 03.11.
import { describe, expect, it } from "vitest";
import { user } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { createAuthRepository } from "./repository";

describe("createAuthRepository", () => {
  it("fullfører bare den ene brukerens konto", async () => {
    const db = createTestDb();
    await db.insert(user).values([
      { id: "kari", name: "Kari", email: "kari@hiof.no" },
      { id: "per", name: "Per", email: "per@hiof.no" },
    ]);

    await createAuthRepository(db).completeAccount("kari", "Kari Hansen", "+4791234567", new Date());

    const rows = await db.select({ id: user.id, name: user.name, phone: user.phone }).from(user);
    expect(rows).toEqual([
      { id: "kari", name: "Kari Hansen", phone: "+4791234567" },
      { id: "per", name: "Per", phone: null },
    ]);
  });

  it("finner bare kodene for samme adresse etter tidspunktet", async () => {
    const db = createTestDb();
    const repository = createAuthRepository(db);
    const now = new Date("2026-11-03T12:00:00Z");
    await repository.recordCodeRequest("hash-a", now);
    await repository.recordCodeRequest("hash-b", now);

    expect(await repository.findCodeRequestsSince("hash-a", new Date(now.getTime() - 1000))).toEqual([now]);
    expect(await repository.findCodeRequestsSince("hash-a", now)).toEqual([]);
  });
});
