// REST-endepunktet GET /api/listings (T03): statuskoder, feltutvalg og limit. Kjøres mot SQLite i
// minnet med appens migrasjoner i stedet for D1. Vakten testes i guards.test.ts. Godkjent av Max 10.10.
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, listingImage, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { getListings } from "./api";

// Den ekte databasen finnes bare i Cloudflare, så handleren får testdatabasen i stedet.
const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));

async function get(query: string) {
  const request = new Request(`http://localhost/api/listings${query}`);
  const response = await getListings({ request } as RequestInfo);
  const body = (await response.json()) as { listings?: unknown[]; error?: string };
  return { status: response.status, body };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no" });
});

describe("GET /api/listings", () => {
  // Forsidebildet til søkeforslagene (#150). Godkjent av Max 11.10.
  it("sender adressen til miniatyren av forsidebildet (posisjon 0) som coverUrl, men ikke de andre bildene", async () => {
    await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator" }));
    await holder.db.insert(listingImage).values([
      { listingId: "calc", key: "listings/calc/b.jpg", position: 1 },
      { listingId: "calc", key: "listings/calc/a.jpg", position: 0 },
    ]);

    const { body } = await get("?q=kalk");

    expect(body.listings).toMatchObject([{ id: "calc", coverUrl: "/images/listings/calc/a.thumb.jpg" }]);
    expect(JSON.stringify(body)).not.toContain("calc/b");
  });

  it("gir 200 med treffene og bare de seks feltene", async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "calc", title: "Kalkulator", description: "Hemmelig notat." }),
      validListing({ id: "tent", title: "Telt for to" }),
    ]);

    const { status, body } = await get("?q=kalk");

    expect(status).toBe(200);
    expect(body.listings).toEqual([{ id: "calc", title: "Kalkulator", type: "sale", price: 250, status: "active", coverUrl: null }]);
    const json = JSON.stringify(body);
    for (const secret of [OWNER_ID, "Hemmelig notat.", "kari@hiof.no"]) {
      expect(json).not.toContain(secret);
    }
  });

  it("limit begrenser antall treff", async () => {
    await holder.db.insert(listing).values([validListing({ id: "a" }), validListing({ id: "b" }), validListing({ id: "c" })]);

    const { body } = await get("?limit=2");

    expect(body.listings).toHaveLength(2);
  });

  it("godtar forsidens filtre (#102)", async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "loan", type: "loan", category: "books" }),
      validListing({ id: "sale", type: "sale", category: "books" }),
      validListing({ id: "bike", type: "loan", category: "bikes" }),
    ]);

    const { body } = await get("?type=loan&category=books");

    expect(body.listings?.map((l) => (l as { id: string }).id)).toEqual(["loan"]);
  });

  it("gir 400 med feilmelding ved ugyldig søk, filter eller limit", async () => {
    const invalid = ["?limit=0", "?limit=51", "?limit=abc", "?limit=2.5", `?q=${"a".repeat(101)}`, "?category=bogus", "?minPrice=5&maxPrice=1"];
    for (const query of invalid) {
      const { status, body } = await get(query);
      expect(status, query).toBe(400);
      expect(body, query).toEqual({ error: "Ugyldig søk." });
    }
  });
});
