// Budsiden /listings/:id/bid (WF-06, #185) mot SQLite i minnet: skjemaet vises bare når et bud er lov.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { BidPage } from "./BidPage";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("rwsdk/worker", () => ({ getRequestInfo: () => ({ ctx: { session: {} } }) }));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function visit(id: string, userId = "kari") {
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const page = await BidPage({ params: { id }, ctx, response } as RequestInfo<{ id: string }>);
  return { page, status: response.status, html: page instanceof Response ? "" : renderToStaticMarkup(page) };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: OWNER_ID, name: "Ola Nordmann", email: "ola@hiof.no" },
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
  ]);
  await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator", price: 250 }));
});

describe("BidPage", () => {
  it("viser annonsekortet, feltet og «Send bud» for en som kan by", async () => {
    const { html, status } = await visit("calc");

    expect(status).toBe(200);
    expect(html).toMatch(/<h1[^>]*>Legg inn bud<\/h1>/);
    for (const text of ["Kalkulator", "Salg · 250 kr", "Selger: Ola Nordmann", "Ditt bud (kr)", "Send bud", "Tilbake til annonsen"]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('name="listingId" value="calc"');
    expect(html).not.toMatch(/name="price"[^>]*value="\d/);
  });

  it("med et bud fra før heter siden «Endre bud» og feltet har det gjeldende budet", async () => {
    await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 220 });

    const { html } = await visit("calc");

    expect(html).toMatch(/<h1[^>]*>Endre bud<\/h1>/);
    expect(html).toMatch(/name="price"[^>]*value="220"|value="220"[^>]*name="price"/);
  });

  it("gir 404 med borte-visning for ukjent, nedtatt og annonser som ikke er salg", async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "hidden", status: "unpublished" }),
      validListing({ id: "loan", type: "loan" }),
    ]);

    for (const id of ["finnes-ikke", "hidden", "loan"]) {
      const { html, status } = await visit(id);
      expect(status).toBe(404);
      expect(html).toContain("Annonsen er ikke lenger tilgjengelig");
      expect(html).not.toContain("Send bud");
    }
  });

  it("sender eieren, en solgt annonse og et besvart bud tilbake til annonsen", async () => {
    await holder.db.insert(listing).values(validListing({ id: "sold", status: "sold" }));
    await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", status: "waiting_requester" });
    await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 220 });

    const own = await visit("calc", OWNER_ID);
    const sold = await visit("sold");
    const answered = await visit("calc");

    for (const [result, id] of [[own, "calc"], [sold, "sold"], [answered, "calc"]] as const) {
      expect(result.page).toBeInstanceOf(Response);
      expect((result.page as Response).headers.get("Location")).toBe(`/listings/${id}`);
    }
  });
});
