// Annonsesiden velger riktig visning og statuskode ut fra annonsens status. Siden kjøres mot
// SQLite i minnet med appens migrasjoner i stedet for D1. Godkjent av Max 08.10.
import { eq } from "drizzle-orm";
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
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
// Serverhandlingen trengs ikke for å tegne «Send forespørsel»-knappen.
vi.mock("@/app/requests/actions", () => ({ sendRequest: vi.fn() }));

async function renderPage(id: string, query = "", userId = "someone-else") {
  const request = new Request(`http://localhost/listings/${id}${query}`);
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const page = await ListingPage({ params: { id }, request, response, ctx } as RequestInfo<{ id: string }>);
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

// Budknappen (#185): A til D i mockupen, plassert under kategori og tilstand (Max 17.10). Godkjent av Max 17.10.
describe("ListingPage, budknappen", () => {
  beforeEach(async () => {
    await holder.db.insert(user).values({ id: "kari", name: "Kari Hansen", email: "kari-h@hiof.no" });
    await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator", price: 250 }));
  });

  it("A: andre ser «Legg inn bud» som lenke til budsiden", async () => {
    const { html } = await renderPage("calc", "", "kari");

    expect(html).toContain('href="/listings/calc/bid"');
    expect(html).toContain("Legg inn bud");
    expect(html).not.toContain("disabled");
  });

  it("knappen står under kategori og tilstand, og over beskrivelsen", async () => {
    const { html } = await renderPage("calc", "", "kari");

    const button = html.indexOf("Legg inn bud");
    expect(html.indexOf("Tilstand")).toBeLessThan(button);
    expect(button).toBeLessThan(html.indexOf("Beskrivelse"));
  });

  it("B: et ventende bud vises som «Ditt bud: 220 kr» med «Endre bud»", async () => {
    await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 220 });

    const { html } = await renderPage("calc", "", "kari");

    expect(html).toMatch(/<a href="\/requests\/r1"[^>]*>Ditt bud: 220 kr<\/a>/);
    expect(html).toContain("Endre bud");
    expect(html).not.toContain("Legg inn bud");
  });

  it("B: har selgeren svart, vises budet uten «Endre bud»", async () => {
    await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", status: "waiting_requester" });
    await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 220 });

    const { html } = await renderPage("calc", "", "kari");

    expect(html).toContain("Ditt bud: 220 kr");
    expect(html).not.toContain("Endre bud");
  });

  it("C og D: eieren og alle på en solgt annonse ser knappen grået ut, uten lenke", async () => {
    await holder.db.insert(listing).values(validListing({ id: "sold", status: "sold" }));

    for (const [id, userId] of [["calc", OWNER_ID], ["sold", "kari"]] as const) {
      const { html } = await renderPage(id, "", userId);
      expect(html).toMatch(/<button[^>]*disabled[^>]*>Legg inn bud<\/button>/);
      expect(html).not.toContain("/bid");
    }
  });

  it("lån og gis bort har aldri budknappen", async () => {
    await holder.db.insert(listing).values([validListing({ id: "loan", type: "loan" }), validListing({ id: "free", type: "giveaway", price: null })]);

    for (const id of ["loan", "free"]) expect((await renderPage(id, "", "kari")).html).not.toContain("Legg inn bud");
  });
});

// Lån og gis bort (#186a): knappene i mockupen, godkjent av Max 20.10.
describe("ListingPage, lån og gis bort", () => {
  beforeEach(async () => {
    await holder.db.insert(user).values({ id: "kari", name: "Kari Hansen", email: "kari-h@hiof.no" });
    await holder.db.insert(listing).values([
      validListing({ id: "tent", type: "loan", price: 60 }),
      validListing({ id: "lamp", type: "giveaway", price: null }),
    ]);
  });

  it("lån: andre ser «Send låneforespørsel» som lenke til lånesiden", async () => {
    const { html } = await renderPage("tent", "", "kari");

    expect(html).toMatch(/<a href="\/listings\/tent\/loan"[^>]*>Send låneforespørsel<\/a>/);
  });

  it("lån: en sendt forespørsel vises som «Din forespørsel: 12.11 – 19.11» og lenker til forespørselen", async () => {
    await holder.db.insert(request).values({ id: "rl", listingId: "tent", requesterId: "kari" });
    await holder.db.insert(offer).values({ requestId: "rl", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19" });

    const { html } = await renderPage("tent", "", "kari");

    expect(html).toMatch(/<a href="\/requests\/rl"[^>]*>Din forespørsel: 12\.11 – 19\.11<\/a>/);
    expect(html).not.toContain("Send låneforespørsel");
  });

  it("gis bort: andre ser «Send forespørsel» som skjemaknapp med annonsen som skjult felt", async () => {
    const { html } = await renderPage("lamp", "", "kari");

    expect(html).toMatch(/<button type="submit"[^>]*>Send forespørsel<\/button>/);
    expect(html).toContain('<input type="hidden" name="listingId" value="lamp"/>');
  });

  it("gis bort: en sendt forespørsel vises som «Din forespørsel sendt» uten skjemaknapp", async () => {
    await holder.db.insert(request).values({ id: "rg", listingId: "lamp", requesterId: "kari" });
    await holder.db.insert(offer).values({ requestId: "rg", senderId: "kari" });

    const { html } = await renderPage("lamp", "", "kari");

    expect(html).toMatch(/<a href="\/requests\/rg"[^>]*>Din forespørsel sendt<\/a>/);
    expect(html).not.toContain("Send forespørsel");
  });

  it("eieren ser knappen grået ut, med riktig navn for hver type, og uten lenke", async () => {
    const loan = (await renderPage("tent", "", OWNER_ID)).html;
    const free = (await renderPage("lamp", "", OWNER_ID)).html;

    expect(loan).toMatch(/<button[^>]*disabled[^>]*>Send låneforespørsel<\/button>/);
    expect(free).toMatch(/<button[^>]*disabled[^>]*>Send forespørsel<\/button>/);
    expect(loan).not.toContain("/loan");
  });

  it("en gis bort som er tatt, har knappen grået ut for andre", async () => {
    await holder.db.update(listing).set({ status: "sold" }).where(eq(listing.id, "lamp"));

    expect((await renderPage("lamp", "", "kari")).html).toMatch(/<button[^>]*disabled[^>]*>Send forespørsel<\/button>/);
  });
});

// Bekreftelsen etter publisering (#133). Godkjent av Max 11.10.
describe("ListingPage etter publisering", () => {
  beforeEach(async () => {
    await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator" }));
  });

  it("eieren ser «Annonsen er publisert» med ?publisert=1", async () => {
    const { html } = await renderPage("calc", "?publisert=1", OWNER_ID);

    expect(html).toContain("Annonsen er publisert og synlig i søket.");
  });

  it("andre ser ikke bekreftelsen, og eieren ser den ikke uten ?publisert=1", async () => {
    expect((await renderPage("calc", "?publisert=1", "someone-else")).html).not.toContain("Annonsen er publisert");
    expect((await renderPage("calc", "", OWNER_ID)).html).not.toContain("Annonsen er publisert");
  });
});
