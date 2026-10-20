// Lånesiden /listings/:id/loan (#186) mot SQLite i minnet: skjemaet vises bare når en låneforespørsel er lov.
// Godkjent av Max 20.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { LoanPage } from "./LoanPage";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("./actions", () => ({ sendRequest: vi.fn() }));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function visit(id: string, userId = "kari") {
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const page = await LoanPage({ params: { id }, ctx, response } as RequestInfo<{ id: string }>);
  return { page, status: response.status, html: page instanceof Response ? "" : renderToStaticMarkup(page) };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: OWNER_ID, name: "Ola Nordmann", email: "ola@hiof.no" },
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await holder.db.insert(listing).values(validListing({ id: "tent", title: "Telt", type: "loan", price: 60 }));
});

describe("LoanPage", () => {
  it("viser annonsekortet, Fra, Til og «Send forespørsel» for en som kan låne", async () => {
    const { html, status } = await visit("tent");

    expect(status).toBe(200);
    expect(html).toMatch(/<h1[^>]*>Send låneforespørsel<\/h1>/);
    for (const text of ["Telt", "Selger: Ola Nordmann", "Fra", "Til", "Send forespørsel", "Tilbake til annonsen"]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('name="listingId" value="tent"');
    expect(html).toMatch(/<input[^>]*type="date"[^>]*name="startDate"|<input[^>]*name="startDate"[^>]*type="date"/);
    expect(html).toMatch(/<input[^>]*type="date"[^>]*name="endDate"|<input[^>]*name="endDate"[^>]*type="date"/);
  });

  it("uten opptatte perioder står det ingen «Opptatt»-liste, og summen vises ikke før datoene er fylt ut", async () => {
    const { html } = await visit("tent");

    expect(html).not.toContain("Opptatt");
    expect(html).not.toContain("Antall dager");
  });

  it("lister godtatte og pågående lån under «Opptatt», sortert, og ikke avslåtte", async () => {
    for (const [id, status, start, end] of [
      ["late", "accepted", "2026-12-01", "2026-12-08"],
      ["early", "in_use", "2026-11-03", "2026-11-10"],
      ["no", "declined", "2026-10-01", "2026-10-08"],
    ] as const) {
      // En aktiv forespørsel per student per annonse, så hver får sin egen student.
      await holder.db.insert(user).values({ id: `u-${id}`, name: `Låner ${id}`, email: `${id}@hiof.no` });
      await holder.db.insert(request).values({ id, listingId: "tent", requesterId: `u-${id}`, status });
      await holder.db.insert(offer).values({ requestId: id, senderId: `u-${id}`, startDate: start, endDate: end });
    }

    const { html } = await visit("tent");

    expect(html).toContain("Opptatt");
    expect(html.indexOf("03.11 – 10.11")).toBeGreaterThan(-1);
    expect(html.indexOf("03.11 – 10.11")).toBeLessThan(html.indexOf("01.12 – 08.12"));
    expect(html).not.toContain("01.10 – 08.10");
  });

  it("gir 404 med borte-visning for ukjent, nedtatt og annonser som ikke er lån", async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "hidden", type: "loan", status: "unpublished" }),
      validListing({ id: "calc", type: "sale", price: 250 }),
      validListing({ id: "free", type: "giveaway", price: null }),
    ]);

    for (const id of ["finnes-ikke", "hidden", "calc", "free"]) {
      const { html, status } = await visit(id);
      expect(status).toBe(404);
      expect(html).toContain("Annonsen er ikke lenger tilgjengelig");
      expect(html).not.toContain("Send forespørsel");
    }
  });

  it("sender eieren og en som allerede har sendt forespørsel tilbake til annonsen", async () => {
    await holder.db.insert(request).values({ id: "r1", listingId: "tent", requesterId: "kari" });
    await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19" });

    for (const userId of [OWNER_ID, "kari"]) {
      const { page } = await visit("tent", userId);
      expect(page).toBeInstanceOf(Response);
      expect((page as Response).headers.get("Location")).toBe("/listings/tent");
    }
  });
});
