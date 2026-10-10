// Forsiden leser søket fra adressen, viser treffene og riktig melding og statuskode. Siden kjøres
// mot SQLite i minnet med appens migrasjoner i stedet for D1. Godkjent av Max 10.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, validListing } from "@/test/test-listings";
import { HomePage } from "./HomePage";

// Den ekte databasen finnes bare i Cloudflare, så siden får testdatabasen i stedet.
const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
// Utloggingsknappen trengs ikke her, og den drar inn innloggingsoppsettet.
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function renderPage(query: string) {
  const request = new Request(`http://localhost/${query}`);
  const response = { status: 200 } as RequestInfo["response"];
  const page = await HomePage({ request, response } as RequestInfo);
  return { html: renderToStaticMarkup(page), status: response.status };
}

// Hele <input>-taggen for én avkrysning, uansett rekkefølgen React skriver attributtene i.
function checkbox(html: string, value: string) {
  return html.match(new RegExp(`<input type="checkbox"[^>]*value="${value}"[^>]*>`))?.[0] ?? "";
}

beforeEach(async () => {
  holder.db = createTestDb();
  await insertOwner(holder.db);
  await holder.db.insert(listing).values([
    validListing({ id: "calc", title: "Kalkulator" }),
    validListing({ id: "tent", title: "Telt for to", description: "Lett telt." }),
  ]);
});

describe("HomePage", () => {
  it("viser bare annonser som passer søket, og feltet beholder søkeordet", async () => {
    const { html, status } = await renderPage("?q=kalk");

    expect(status).toBe(200);
    expect(html).toContain("Kalkulator");
    expect(html).not.toContain("Telt for to");
    expect(html).toMatch(/<input[^>]*name="q"[^>]*value="kalk"/);
  });

  it("gir 400 og «Ugyldig søk» for et søk over 100 tegn", async () => {
    const { html, status } = await renderPage(`?q=${"a".repeat(101)}`);

    expect(status).toBe(400);
    expect(html).toContain("Ugyldig søk");
    expect(html).not.toContain("Kalkulator");
  });

  it("viser «Ingen annonser passer søket» med lenke til alle annonser når ingenting passer", async () => {
    const { html, status } = await renderPage("?q=mikroskop");

    expect(status).toBe(200);
    expect(html).toContain("Ingen annonser passer søket");
    expect(html).toMatch(/<a href="\/"[^>]*>Fjern søk<\/a>/);
  });

  // Filtrene (#102). Godkjent av Max 10.10.
  it("filtrerer på adressen og viser valgene igjen i filterfeltene og på knappen", async () => {
    await holder.db.insert(listing).values(validListing({ id: "book", title: "Pensumbok", category: "books", type: "loan" }));

    const { html, status } = await renderPage("?category=books&type=loan");

    expect(status).toBe(200);
    expect(html).toContain("Pensumbok");
    expect(html).not.toContain("Kalkulator");
    expect(html).toMatch(/<option value="books" selected="">Bøker og pensum<\/option>/);
    expect(checkbox(html, "loan")).toContain('checked=""');
    expect(checkbox(html, "sale")).not.toContain('checked=""');
    expect(html).toContain("Vis 1 annonse");
  });

  // Prisfeltene uten pilknapper (#120). Godkjent av Max 10.10.
  it("prisfeltene er tekstfelt med tallastatur, ikke type=number", async () => {
    const { html } = await renderPage("?minPrice=10");

    const field = html.match(/<input[^>]*name="minPrice"[^>]*>/)?.[0] ?? "";
    expect(field).toContain('type="text"');
    expect(field).toContain('inputMode="numeric"');
    expect(field).toContain('value="10"');
  });

  it("gir 400 og «Ugyldig søk» for en ukjent filterverdi", async () => {
    const { html, status } = await renderPage("?type=rent");

    expect(status).toBe(400);
    expect(html).toContain("Ugyldig søk");
    expect(html).not.toContain("Kalkulator");
  });

  it("filter uten treff gir «Ingen annonser passer søket», ikke «ennå»", async () => {
    const { html } = await renderPage("?category=bikes");

    expect(html).toContain("Ingen annonser passer søket");
  });

  it("siden har egen fanetittel", async () => {
    const { html } = await renderPage("");

    expect(html).toContain("<title>Annonser – Studentmarkedet</title>");
  });
});
