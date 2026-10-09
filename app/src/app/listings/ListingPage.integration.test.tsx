// Annonsesiden velger riktig visning og statuskode ut fra annonsens status. Siden kjøres mot
// SQLite i minnet med appens migrasjoner i stedet for D1. Godkjent av Max 08.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { ListingPage } from "./ListingPage";

// Den ekte databasen finnes bare i Cloudflare, så siden får testdatabasen i stedet.
const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
// Utloggingsknappen trengs ikke her, og den drar inn innloggingsoppsettet.
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function renderPage(id: string) {
  const response = { status: 200 } as RequestInfo["response"];
  const page = await ListingPage({ params: { id }, response } as RequestInfo<{ id: string }>);
  return { html: renderToStaticMarkup(page), status: response.status };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no" });
});

describe("ListingPage", () => {
  it("viser alle feltene for en aktiv annonse, uten Solgt-merke", async () => {
    await holder.db.insert(listing).values(
      validListing({ id: "calc", title: "Kalkulator", description: "Lite brukt.", category: "electronics", condition: "like_new", price: 250 }),
    );

    const { html, status } = await renderPage("calc");

    expect(status).toBe(200);
    expect(html).toMatch(/<h1[^>]*>Kalkulator<\/h1>/);
    for (const text of ["Salg", "250 kr", "Elektronikk", "Som ny", "Lite brukt.", "Kari Nordmann"]) {
      expect(html).toContain(text);
    }
    expect(html).not.toContain("Solgt");
  });

  it("viser en solgt annonse med Solgt-merke og status 200", async () => {
    await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator", status: "sold" }));

    const { html, status } = await renderPage("calc");

    expect(status).toBe(200);
    expect(html).toContain("Kalkulator");
    expect(html).toContain("Solgt");
  });

  it("gir samme borte-visning og 404 for en nedtatt og en ukjent annonse", async () => {
    await holder.db.insert(listing).values(validListing({ id: "hidden", title: "Skjult vare", status: "unpublished" }));

    const hidden = await renderPage("hidden");
    const unknown = await renderPage("finnes-ikke");

    expect(hidden.status).toBe(404);
    expect(unknown.status).toBe(404);
    expect(hidden.html).toContain("Annonsen er ikke lenger tilgjengelig");
    expect(hidden.html).not.toContain("Skjult vare");
    expect(hidden.html).toBe(unknown.html);
  });
});
