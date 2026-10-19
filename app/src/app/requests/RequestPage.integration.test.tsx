// Forespørselssiden /requests/:id (WF-08, #192) mot SQLite i minnet: bare de to partene ser den, og den viser
// status, siste bud og historikk, knappene bare for den som har tur (#187), og aldri kontaktinfo. Godkjent av Max 17.10 og 18.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
// Serverhandlingen trengs ikke for å tegne knappene.
vi.mock("./actions", () => ({ respondToRequest: vi.fn() }));

async function visit(id: string, userId: string, query = "") {
  const response = { status: 200 } as RequestInfo["response"];
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const request = new Request(`https://studentmarkedet.test/requests/${id}${query}`);
  const page = await RequestPage({ params: { id }, ctx, response, request } as RequestInfo<{ id: string }>);
  return { html: renderToStaticMarkup(page), status: response.status };
}

// Klokken står stille: forespørsler utløper etter 7 dager (#187), og budene under er fra 17.10.
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-18T12:00:00Z"));
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

afterEach(() => {
  vi.useRealTimers();
});

describe("RequestPage, selgeren", () => {
  it("viser nytt bud, siste bud og din pris, og historikken med nyeste først", async () => {
    const { html, status } = await visit("r1", OWNER_ID);

    expect(status).toBe(200);
    for (const text of ["Kalkulator", "Salg · 250 kr", "Nytt bud fra Kari Hansen", "Din pris", "250 kr", "Historikk"]) {
      expect(html).toContain(text);
    }
    expect(html).toMatch(/Bud<\/dt><dd[^>]*>230\s*kr<\/dd>/);
    expect(html.indexOf("Kari Hansen bød 230 kr")).toBeLessThan(html.indexOf("Kari Hansen bød 220 kr"));
    expect(html).not.toContain("Selger:");
  });

  it("banneret har mørk kant (din tur) og ingen mørk fyll, og bare det eldste budet i historikken er grået", async () => {
    const { html } = await visit("r1", OWNER_ID);

    expect(html).toMatch(/<p role="status" class="[^"]*border-ink[^"]*"[^>]*>Nytt bud fra/);
    expect(html).not.toMatch(/<p role="status" class="[^"]*bg-action/);
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

describe("RequestPage, lenkene (#193)", () => {
  it("tilbakelenken går til Mottatt for selgeren og Sendt for kjøperen, og heter «Min side»", async () => {
    const owner = (await visit("r1", OWNER_ID)).html;
    const buyer = (await visit("r1", "kari")).html;

    expect(owner).toMatch(/<a href="\/me"[^>]*><span aria-hidden="true">‹<\/span> Min side<\/a>/);
    expect(buyer).toMatch(/<a href="\/me\?show=sent"[^>]*><span aria-hidden="true">‹<\/span> Min side<\/a>/);
    expect(owner).not.toContain("Tilbake til annonsen");
  });

  it("annonsekortet er en lenke til annonsen, for begge parter", async () => {
    for (const userId of [OWNER_ID, "kari"]) {
      expect((await visit("r1", userId)).html).toMatch(/<a href="\/listings\/calc"[^>]*>Kalkulator<\/a>/);
    }
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

describe("RequestPage, knappene (#187)", () => {
  const buttons = ["Godta", "Motbud", "Avslå"];
  const hasButtons = (html: string) => buttons.every((text) => html.includes(`>${text}</button>`));
  const hasNoButtons = (html: string) => !html.includes("<button") && !html.includes('name="offerId"');

  it("selgeren har tur: Godta, Motbud og Avslå under budkortet, med forespørselen og det siste forslaget som skjulte felt", async () => {
    const { html } = await visit("r1", OWNER_ID);
    const [, latest] = await holder.db.select().from(offer);

    expect(hasButtons(html)).toBe(true);
    expect(html).toContain(`<input type="hidden" name="requestId" value="r1"/>`);
    expect(html).toContain(`<input type="hidden" name="offerId" value="${latest.id}"/>`);
    expect(html.indexOf("Din pris")).toBeLessThan(html.indexOf(">Godta</button>"));
  });

  it("kjøperen mens selgeren har tur: ingen knapper", async () => {
    expect(hasNoButtons((await visit("r1", "kari")).html)).toBe(true);
  });

  it("etter et motbud er det kjøperen som har knappene, ikke selgeren", async () => {
    await holder.db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date("2026-10-17T09:00:00Z") });
    await holder.db.update(request).set({ status: "waiting_requester" });

    expect(hasButtons((await visit("r1", "kari")).html)).toBe(true);
    expect(hasNoButtons((await visit("r1", OWNER_ID)).html)).toBe(true);
  });

  it("ingen knapper på en avsluttet forespørsel, for noen av partene", async () => {
    for (const status of ["accepted", "declined", "withdrawn", "cancelled", "in_use", "completed"] as const) {
      await holder.db.update(request).set({ status });
      for (const userId of [OWNER_ID, "kari"]) {
        expect(hasNoButtons((await visit("r1", userId)).html), `${status} ${userId}`).toBe(true);
      }
    }
  });

  it("ingen knapper etter 7 dager: forespørselen vises som utløpt, selv om databasen ennå sier at den venter", async () => {
    vi.setSystemTime(new Date("2026-10-25T12:00:00Z"));

    for (const userId of [OWNER_ID, "kari"]) {
      const { html } = await visit("r1", userId);
      expect(html).toContain("Utløpt");
      expect(hasNoButtons(html)).toBe(true);
    }
    expect((await holder.db.select().from(request))[0].status).toBe("waiting_owner");
  });

  it("aldri telefon eller e-post, med eller uten knapper", async () => {
    for (const userId of [OWNER_ID, "kari"]) {
      expect((await visit("r1", userId)).html).not.toMatch(/@hiof\.no|\+47/);
    }
  });

  it("en tredjepart får ingen knapper og ingenting om forespørselen", async () => {
    expect(hasNoButtons((await visit("r1", "per")).html)).toBe(true);
  });
});

describe("RequestPage, meldingen etter svar (#203)", () => {
  const toast = (html: string) => html.match(/<div role="status"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";

  it("selgeren ser «Motbud sendt» med beløpet etter et motbud", async () => {
    await holder.db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date("2026-10-17T09:00:00Z") });
    await holder.db.update(request).set({ status: "waiting_requester" });

    const { html } = await visit("r1", OWNER_ID, "?sendt=motbud");

    expect(toast(html).replace(/\s/g, " ")).toContain("Motbud sendt: 240 kr");
  });

  it("«Du godtok budet» og «Forespørselen er avslått» når statusen stemmer", async () => {
    await holder.db.update(request).set({ status: "accepted" });
    expect(toast((await visit("r1", OWNER_ID, "?sendt=godtatt")).html)).toContain("Du godtok budet");

    await holder.db.update(request).set({ status: "declined" });
    expect(toast((await visit("r1", OWNER_ID, "?sendt=avslatt")).html)).toContain("Forespørselen er avslått");
  });

  it("ingen melding uten markør, med en markør som ikke stemmer, eller for den som ikke sendte motbudet", async () => {
    expect(toast((await visit("r1", OWNER_ID)).html)).toBe("");
    expect(toast((await visit("r1", OWNER_ID, "?sendt=godtatt")).html)).toBe("");
    // Siste forslag er kjøperens, så selgeren har ikke «sendt et motbud».
    expect(toast((await visit("r1", OWNER_ID, "?sendt=motbud")).html)).toBe("");
  });

  it("en tredjepart får 404 og ingen melding, selv med markør", async () => {
    const { html, status } = await visit("r1", "per", "?sendt=motbud");

    expect(status).toBe(404);
    expect(toast(html)).toBe("");
  });
});
