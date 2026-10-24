// «Administrer» /listings/:id/edit (#229, AK-49) mot SQLite i minnet: bare eieren av en aktiv annonse får skjemaet,
// fylt ut, med låst handelstype og bildene bare vist. Godkjent av Max 24.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, listingImage, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { EditListingPage } from "./EditListingPage";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
// Serverhandlingene og utloggingen trengs ikke for å tegne siden.
vi.mock("./actions", () => ({ createListing: vi.fn(), updateListing: vi.fn(), takeDownListing: vi.fn() }));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function visit(id: string, userId: string) {
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const page = await EditListingPage({ params: { id }, response, ctx } as RequestInfo<{ id: string }>);
  return { html: renderToStaticMarkup(page), status: response.status };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: OWNER_ID, name: "Ola Nordmann", email: "ola@hiof.no" },
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
  ]);
  await holder.db.insert(listing).values([
    validListing({ id: "calc", title: "Kalkulator", description: "Lite brukt.", category: "electronics", condition: "like_new", price: 250 }),
    validListing({ id: "sold", status: "sold" }),
    validListing({ id: "down", status: "unpublished" }),
  ]);
  await holder.db.insert(listingImage).values({ listingId: "calc", key: "listings/calc/a.jpg", position: 0 });
});

describe("EditListingPage", () => {
  it("gir eieren skjemaet fylt ut, med Lagre endringer, låst handelstype og bildene bare vist", async () => {
    const { html, status } = await visit("calc", OWNER_ID);

    expect(status).toBe(200);
    expect(html).toMatch(/<h1[^>]*>Administrer annonse<\/h1>/);
    expect(html).toMatch(/<input[^>]*name="title"[^>]*value="Kalkulator"/);
    expect(html).toMatch(/<textarea[^>]*>Lite brukt\.<\/textarea>/);
    expect(html).toMatch(/<option value="electronics" selected="">/);
    expect(html).toMatch(/<input[^>]*name="price"[^>]*value="250"/);
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="like_new"|<input[^>]*value="like_new"[^>]*checked=""/);
    expect(html).toMatch(/<fieldset disabled=""[^>]*><legend[^>]*>Handelstype<\/legend>/);
    expect(html).toContain("/images/listings/calc/a.thumb.jpg");
    expect(html).toContain("Lagre endringer");
    expect(html).toContain("Slett annonse");
  });

  it("gir 404 og borte-visningen til en annen bruker, og for solgte og slettede annonser", async () => {
    for (const [id, userId] of [["calc", "kari"], ["sold", OWNER_ID], ["down", OWNER_ID], ["finnes-ikke", OWNER_ID]] as const) {
      const { html, status } = await visit(id, userId);
      expect(status).toBe(404);
      expect(html).toContain("Annonsen er ikke lenger tilgjengelig");
      expect(html).not.toContain('name="title"');
    }
  });
});
