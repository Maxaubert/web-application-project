// Forespørselssiden /requests/:id (WF-08, #192) mot SQLite i minnet: bare de to partene ser den, og den viser
// status, siste bud og historikk uten handlinger og uten kontaktinfo. Godkjent av Max 17.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { RequestPage } from "./RequestPage";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function visit(id: string, userId: string) {
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const page = await RequestPage({ params: { id }, ctx, response } as RequestInfo<{ id: string }>);
  return { html: renderToStaticMarkup(page), status: response.status };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: OWNER_ID, name: "Ola Nordmann", email: "ola@hiof.no", phone: "+4790000001" },
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4790000002" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no", phone: "+4790000003" },
  ]);
  await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator", price: 250 }));
  await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
  await holder.db.insert(offer).values([
    { requestId: "r1", senderId: "kari", price: 220, createdAt: new Date("2026-10-17T01:12:00Z") },
    { requestId: "r1", senderId: "kari", price: 230, createdAt: new Date("2026-10-17T01:20:00Z") },
  ]);
});

describe("RequestPage, selgeren", () => {
  it("viser nytt bud, siste bud og din pris, og historikken med nyeste først", async () => {
    const { html, status } = await visit("r1", OWNER_ID);

    expect(status).toBe(200);
    for (const text of ["Kalkulator", "Salg · 250 kr", "Nytt bud fra Kari Hansen", "Din pris", "250 kr", "Historikk", "Tilbake til annonsen"]) {
      expect(html).toContain(text);
    }
    expect(html).toMatch(/Bud<\/dt><dd[^>]*>230\s*kr<\/dd>/);
    expect(html.indexOf("Kari Hansen bød 230 kr")).toBeLessThan(html.indexOf("Kari Hansen bød 220 kr"));
    expect(html).not.toContain("Selger:");
  });

  it("banneret er mørkt (din tur), og bare det eldste budet i historikken er grået", async () => {
    const { html } = await visit("r1", OWNER_ID);

    expect(html).toMatch(/<p role="status" class="[^"]*bg-action[^"]*"[^>]*>Nytt bud fra/);
    expect(html).toMatch(/<li class="[^"]*text-muted[^"]*"[^>]*>(?:<span[^>]*><\/span>)?[^<]*bød 220 kr/);
    expect(html).not.toMatch(/<li class="[^"]*text-muted[^"]*"[^>]*>(?:<span[^>]*><\/span>)?[^<]*bød 230 kr/);
  });
});

describe("RequestPage, kjøperen", () => {
  it("viser at hen venter på selgeren, «Ditt bud» og «Du bød» i historikken", async () => {
    const { html, status } = await visit("r1", "kari");

    expect(status).toBe(200);
    for (const text of ["Venter på svar fra Ola Nordmann", "Selger: Ola Nordmann", "Du bød 230 kr", "Du bød 220 kr"]) {
      expect(html).toContain(text);
    }
    expect(html).toMatch(/Ditt bud<\/dt><dd[^>]*>230\s*kr<\/dd>/);
    expect(html).toMatch(/Pris<\/dt>/);
    expect(html).not.toContain("Din pris");
    expect(html).toMatch(/<p role="status" class="[^"]*border-hairline[^"]*"[^>]*>Venter på svar/);
  });

  it("viser en avsluttet forespørsel med statusen, også når annonsen er tatt ned", async () => {
    await holder.db.update(request).set({ status: "declined" });
    await holder.db.update(listing).set({ status: "unpublished" });

    const { html, status } = await visit("r1", "kari");

    expect(status).toBe(200);
    expect(html).toContain("Avslått");
    expect(html).toContain("Kalkulator");
  });
});

describe("RequestPage, alle andre", () => {
  it("gir 404 med borte-visning for en tredjepart og for en ukjent forespørsel, og viser ingenting om forespørselen", async () => {
    const stranger = await visit("r1", "per");
    const unknown = await visit("finnes-ikke", "per");

    for (const { html, status } of [stranger, unknown]) {
      expect(status).toBe(404);
      expect(html).toContain("Annonsen er ikke lenger tilgjengelig");
      expect(html).not.toMatch(/Kalkulator|Kari Hansen|230/);
    }
    expect(stranger.html).toBe(unknown.html);
  });
});

describe("RequestPage, innholdet", () => {
  it("har ingen handlingsknapper ennå, og aldri telefon eller e-post", async () => {
    for (const userId of [OWNER_ID, "kari"]) {
      const { html } = await visit("r1", userId);
      expect(html).not.toMatch(/<button|Godta|Avslå|Foreslå/);
      expect(html).not.toMatch(/@hiof\.no|\+47/);
    }
  });
});
