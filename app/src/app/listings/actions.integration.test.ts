// Serverhandlingen createListing (FK-03, #131) mot SQLite i minnet med appens migrasjoner. Beviser både
// avvisning og uendret lagring ved ulovlig skriving, og at eieren alltid kommer fra økten. Godkjent av Max 11.10.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, listingImage, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestBucket, imageFile, type TestBucket } from "@/test/test-bucket";
import { createTestDb } from "@/test/test-db";
import { createListing } from "./actions";

type Session = { isAuthenticated: boolean; userId?: string; needsSetup?: boolean };

// Den ekte databasen og forespørselen finnes bare i Cloudflare; testen setter dem selv.
const holder = vi.hoisted(() => ({ db: undefined as unknown as Db, session: {} as Session, bucket: undefined as unknown as TestBucket }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("rwsdk/worker", () => ({ getRequestInfo: () => ({ ctx: { session: holder.session } }) }));
vi.mock("@/app/images/bucket", () => ({
  get imageBucket() {
    return holder.bucket;
  },
}));

function formData(fields: Record<string, string>, images: File[] = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  for (const image of images) data.append("images", image);
  return data;
}

const VALID = {
  title: "Skjerm 24 tommer",
  description: "HDMI-kabel følger med.",
  category: "electronics",
  type: "loan",
  condition: "used",
  price: "100",
};

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: "kari", name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" },
    { id: "ola", name: "Ola Nordmann", email: "ola@hiof.no", phone: "+4798765432" },
  ]);
  holder.session = { isAuthenticated: true, userId: "kari", needsSetup: false };
  holder.bucket = createTestBucket();
});

describe("createListing", () => {
  it("uten økt sendes brukeren til innlogging, og ingenting lagres", async () => {
    holder.session = { isAuthenticated: false };

    const result = await createListing({}, formData(VALID));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/login");
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("uten fullført kontooppsett sendes brukeren dit, og ingenting lagres", async () => {
    holder.session = { isAuthenticated: true, userId: "kari", needsSetup: true };

    const result = await createListing({}, formData(VALID));

    expect((result as Response).headers.get("Location")).toBe("/account-setup");
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("ugyldig skjema gir feilene og verdiene tilbake, og ingenting lagres", async () => {
    const result = await createListing({}, formData({ ...VALID, title: "", price: "100,-" }));

    expect(result).toMatchObject({
      fieldErrors: { title: "Skriv en tittel", price: "Pris må være et helt tall, for eksempel 250" },
      values: { description: "HDMI-kabel følger med.", price: "100,-" },
    });
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("gyldig skjema lagrer én aktiv annonse med eieren fra økten, selv om skjemaet sender en annen eier", async () => {
    const result = await createListing({}, formData({ ...VALID, ownerId: "ola", status: "sold" }));

    const rows = await holder.db.select().from(listing);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ownerId: "kari", status: "active", type: "loan", price: 100, title: "Skjerm 24 tommer" });
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe(`/listings/${rows[0].id}?publisert=1`);
  });

  // Bilder (#138). Godkjent av Max 11.10.
  it("lagrer bildene i R2 og radene i rekkefølge, med forsidebildet først", async () => {
    await createListing({}, formData(VALID, [imageFile("forside.jpg"), imageFile("baksiden.png", "png")]));

    const [saved] = await holder.db.select().from(listing);
    const rows = await holder.db.select().from(listingImage).orderBy(listingImage.position);
    expect(rows.map((r) => r.position)).toEqual([0, 1]);
    expect(rows.every((r) => r.listingId === saved.id && r.key.startsWith(`listings/${saved.id}/`))).toBe(true);
    expect(rows[1].key).toMatch(/\.png$/);
    expect([...holder.bucket.objects.keys()].sort()).toEqual(rows.map((r) => r.key).sort());
  });

  it("for mange eller ugyldige bilder gir feil sammen med feltfeilene, og ingenting lagres i databasen eller R2", async () => {
    const eleven = Array.from({ length: 11 }, (_, i) => imageFile(`${i}.jpg`));
    expect(await createListing({}, formData({ ...VALID, title: "" }, eleven))).toMatchObject({
      fieldErrors: { title: "Skriv en tittel", images: "Høyst 10 bilder" },
    });

    const fake = new File([new TextEncoder().encode("ikke et bilde")], "bilde.jpg");
    expect(await createListing({}, formData(VALID, [fake]))).toMatchObject({
      fieldErrors: { images: "«bilde.jpg» er ikke et bilde (JPEG, PNG eller WebP)" },
    });

    expect(await holder.db.select().from(listing)).toHaveLength(0);
    expect(await holder.db.select().from(listingImage)).toHaveLength(0);
    expect(holder.bucket.objects.size).toBe(0);
  });

  it("feiler databasen etter at bildene er lagret, slettes både annonsen og bildene", async () => {
    const insert = holder.db.insert.bind(holder.db);
    holder.db.insert = ((table: unknown) => {
      if (table === listingImage) throw new Error("databasen feilet");
      return insert(table as never);
    }) as typeof holder.db.insert;

    await expect(createListing({}, formData(VALID, [imageFile("a.jpg")]))).rejects.toThrow("databasen feilet");

    expect(await holder.db.select().from(listing)).toHaveLength(0);
    expect(holder.bucket.objects.size).toBe(0);
  });
});
