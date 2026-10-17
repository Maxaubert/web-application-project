// getProfile (#193) mot SQLite i minnet: hentes for den innloggede, uten andre kolonner.
import { beforeEach, describe, expect, it } from "vitest";
import { user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { getProfile } from "./queries";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4791234567" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
});

describe("getProfile", () => {
  it("gir navn, e-post og telefon for brukeren", async () => {
    expect(await getProfile(db, "kari")).toEqual({ name: "Kari Hansen", email: "kari@hiof.no", phone: "+4791234567" });
  });

  it("gir telefon null når kontooppsettet ikke har den", async () => {
    expect(await getProfile(db, "per")).toEqual({ name: "Per Olsen", email: "per@hiof.no", phone: null });
  });

  it("gir undefined for en ukjent eller tom id, og aldri en annen brukers rad", async () => {
    expect(await getProfile(db, "finnes-ikke")).toBeUndefined();
    expect(await getProfile(db, "")).toBeUndefined();
  });
});
