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

  it("siden har egen fanetittel", async () => {
    const { html } = await renderPage("");

    expect(html).toContain("<title>Annonser – Studentmarkedet</title>");
  });
});
