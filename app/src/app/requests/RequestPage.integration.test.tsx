// Forespørselssiden /requests/:id (WF-08, #192) mot SQLite i minnet: bare de to partene ser den, og den viser
// status og siste bud, knappene bare for den som har tur (#187), og aldri kontaktinfo. Godkjent av Max 17.10 og 18.10.
import { eq } from "drizzle-orm";
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
vi.mock("./actions", () => ({ respondToRequest: vi.fn(), updateRequest: vi.fn() }));

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
  it("viser nytt bud, siste bud og din pris", async () => {
    const { html, status } = await visit("r1", OWNER_ID);

    expect(status).toBe(200);
    for (const text of ["Kalkulator", "Salg · 250 kr", "Nytt bud fra Kari Hansen", "Din pris", "250 kr"]) {
      expect(html).toContain(text);
    }
    expect(html).toMatch(/Bud<\/dt><dd[^>]*>230\s*kr<\/dd>/);
    expect(html).not.toContain("Selger:");
  });

  it("banneret har mørk kant (din tur) og ingen mørk fyll", async () => {
    const { html } = await visit("r1", OWNER_ID);

    expect(html).toMatch(/<p role="status" class="[^"]*border-ink[^"]*"[^>]*>Nytt bud fra/);
    expect(html).not.toMatch(/<p role="status" class="[^"]*bg-action/);
  });
});

describe("RequestPage, kjøperen", () => {
  it("viser at hen venter på selgeren og «Ditt bud»", async () => {
    const { html, status } = await visit("r1", "kari");

    expect(status).toBe(200);
    for (const text of ["Venter på svar fra Ola Nordmann", "Selger: Ola Nordmann"]) {
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

  it("kjøperen mens selgeren har tur: ingen svarknapper, bare Trekk tilbake (#188)", async () => {
    const { html } = await visit("r1", "kari");

    expect(html).not.toMatch(/name="offerId"|>Godta<|>Motbud<|>Avslå</);
    expect(html).toContain(">Trekk tilbake</button>");
  });

  it("etter et motbud er det kjøperen som har knappene, ikke selgeren", async () => {
    await holder.db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date("2026-10-17T09:00:00Z") });
    await holder.db.update(request).set({ status: "waiting_requester" });

    expect(hasButtons((await visit("r1", "kari")).html)).toBe(true);
    expect(hasNoButtons((await visit("r1", OWNER_ID)).html)).toBe(true);
  });

  it("ingen knapper på en avsluttet forespørsel, for noen av partene", async () => {
    for (const status of ["declined", "withdrawn", "cancelled", "in_use", "completed"] as const) {
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

// Lån og gis bort (#186a, #208): periode og pris i kortet, "Ny forespørsel" i banneret, og svarknappene for den som har tur.
describe("RequestPage, lån og gis bort (#186a)", () => {
  beforeEach(async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "tent", title: "Telt", type: "loan", price: 60 }),
      validListing({ id: "lamp", title: "Lampe", type: "giveaway", price: null }),
    ]);
    await holder.db.insert(request).values([
      { id: "rl", listingId: "tent", requesterId: "kari" },
      { id: "rg", listingId: "lamp", requesterId: "kari" },
    ]);
    await holder.db.insert(offer).values([
      { requestId: "rl", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19", createdAt: new Date("2026-10-17T01:12:00Z") },
      { requestId: "rg", senderId: "kari", createdAt: new Date("2026-10-17T01:12:00Z") },
    ]);
  });

  it("lån: periode og pris (avrundet opp) i kortet for begge parter, og ingen «Bud»", async () => {
    for (const userId of [OWNER_ID, "kari"]) {
      const { html } = await visit("rl", userId);
      expect(html).toMatch(/Periode<\/dt><dd[^>]*>12\.11 – 19\.11<\/dd>/);
      expect(html).toMatch(/Pris<\/dt><dd[^>]*>69\s*kr<\/dd>/);
      expect(html).not.toMatch(/Bud<\/dt>|Din pris/);
    }
  });

  it("lån uten ukepris viser «Gratis»", async () => {
    await holder.db.update(listing).set({ price: null }).where(eq(listing.id, "tent"));

    expect((await visit("rl", OWNER_ID)).html).toMatch(/Pris<\/dt><dd[^>]*>Gratis<\/dd>/);
  });

  it("eieren ser «Ny forespørsel fra Kari Hansen» med mørk kant, kjøperen venter", async () => {
    for (const id of ["rl", "rg"]) {
      expect((await visit(id, OWNER_ID)).html).toMatch(/<p role="status" class="[^"]*border-ink[^"]*"[^>]*>Ny forespørsel fra Kari Hansen/);
      expect((await visit(id, "kari")).html).toContain("Venter på svar fra Ola Nordmann");
    }
  });

  it("gis bort har ikke noe budkort (ingen pris og ingen periode å vise)", async () => {
    const { html } = await visit("rg", OWNER_ID);

    expect(html).not.toMatch(/<dl|Periode|Pris/);
  });

  it("lån: eieren har Godta, Motbud og Avslå under periodekortet, med forespørselen og forslaget som skjulte felt", async () => {
    const { html } = await visit("rl", OWNER_ID);
    const [, , latest] = await holder.db.select().from(offer);

    for (const text of ["Godta", "Motbud", "Avslå"]) expect(html).toContain(`>${text}</button>`);
    expect(html).toContain(`<input type="hidden" name="requestId" value="rl"/>`);
    expect(html).toContain(`<input type="hidden" name="offerId" value="${latest.id}"/>`);
    expect(html.indexOf("Periode")).toBeLessThan(html.indexOf(">Godta</button>"));
  });

  it("gis bort: eieren har bare Godta og Avslå, aldri Motbud", async () => {
    const { html } = await visit("rg", OWNER_ID);

    expect(html).toContain(">Godta</button>");
    expect(html).toContain(">Avslå</button>");
    expect(html).not.toContain("Motbud");
  });

  it("kjøperen har ingen svarknapper mens eieren har tur, på lån og gis bort", async () => {
    for (const id of ["rl", "rg"]) {
      expect((await visit(id, "kari")).html).not.toMatch(/name="offerId"|>Godta<|>Motbud<|>Avslå</);
    }
  });

  it("etter et lånemotbud er det låneren som har knappene, ikke eieren", async () => {
    await holder.db.insert(offer).values({ requestId: "rl", senderId: OWNER_ID, startDate: "2026-11-14", endDate: "2026-11-21", createdAt: new Date("2026-10-17T09:00:00Z") });
    await holder.db.update(request).set({ status: "waiting_requester" }).where(eq(request.id, "rl"));

    const buyer = (await visit("rl", "kari")).html;
    expect(buyer).toContain(">Godta</button>");
    expect(buyer).toMatch(/Periode<\/dt><dd[^>]*>14\.11 – 21\.11<\/dd>/);
    expect((await visit("rl", OWNER_ID)).html).not.toMatch(/<button|name="offerId"/);
  });

  it("ingen knapper på en avsluttet lånforespørsel", async () => {
    await holder.db.update(request).set({ status: "declined" }).where(eq(request.id, "rl"));

    for (const userId of [OWNER_ID, "kari"]) expect((await visit("rl", userId)).html).not.toMatch(/<button|name="offerId"/);
  });
});

// Etter godtatt (#188): kontaktinfo, hvem som har bekreftet, og knappene for å bekrefte, avbestille og trekke tilbake.
describe("RequestPage, overlevering og kontakt (#188)", () => {
  const contactCard = (html: string) => html.includes("for å avtale overlevering");
  const setStatus = (status: (typeof request.$inferSelect)["status"], flags: Partial<typeof request.$inferSelect> = {}) =>
    holder.db.update(request).set({ status, ...flags }).where(eq(request.id, "r1"));

  it("godtatt: begge ser den andres navn, telefon og e-post og linjen «Kontakt … for å avtale overlevering», aldri sin egen", async () => {
    await setStatus("accepted");

    const owner = (await visit("r1", OWNER_ID)).html;
    const buyer = (await visit("r1", "kari")).html;

    expect(owner).toContain("Kontakt Kari for å avtale overlevering");
    expect(owner).toContain("Kari Hansen");
    expect(owner).toContain('href="tel:+4790000002"');
    expect(owner).toContain('href="mailto:kari@hiof.no"');
    expect(owner).not.toMatch(/ola@hiof\.no|\+4790000001/);
    expect(buyer).toContain("Kontakt Ola for å avtale overlevering");
    expect(buyer).toContain('href="mailto:ola@hiof.no"');
    expect(buyer).not.toMatch(/kari@hiof\.no|\+4790000002/);
  });

  it("uten telefonnummer vises bare e-posten", async () => {
    await setStatus("accepted");
    await holder.db.update(user).set({ phone: null }).where(eq(user.id, "kari"));

    const { html } = await visit("r1", OWNER_ID);

    expect(html).toContain('href="mailto:kari@hiof.no"');
    expect(html).not.toMatch(/tel:|Telefon/);
  });

  it("kontaktkortet vises i godtatt, i bruk og fullført, og ellers aldri", async () => {
    for (const status of ["waiting_owner", "waiting_requester", "declined", "withdrawn", "expired", "cancelled"] as const) {
      await setStatus(status);
      for (const userId of [OWNER_ID, "kari"]) {
        const { html } = await visit("r1", userId);
        expect(contactCard(html), `${status} ${userId}`).toBe(false);
        expect(html, `${status} ${userId}`).not.toMatch(/@hiof\.no|\+47/);
      }
    }
    for (const status of ["accepted", "in_use", "completed"] as const) {
      await setStatus(status);
      for (const userId of [OWNER_ID, "kari"]) expect(contactCard((await visit("r1", userId)).html), `${status} ${userId}`).toBe(true);
    }
  });

  it("en tredjepart får 404 og ingen kontaktinfo, også etter godtatt", async () => {
    await setStatus("accepted");

    const { html, status } = await visit("r1", "per");

    expect(status).toBe(404);
    expect(html).not.toMatch(/@hiof\.no|\+47|overlevering/);
  });

  it("godtatt: Bekreft overlevering (sender «confirm») og Avbestill, for begge parter, og ingen Trekk tilbake", async () => {
    await setStatus("accepted");

    for (const userId of [OWNER_ID, "kari"]) {
      const { html } = await visit("r1", userId);
      expect(html, userId).toMatch(/<button type="submit"(?=[^>]*name="intent")(?=[^>]*value="confirm")[^>]*>Bekreft overlevering<\/button>/);
      expect(html, userId).toMatch(/<button type="button"[^>]*>Avbestill<\/button>/);
      expect(html, userId).toContain('<input type="hidden" name="requestId" value="r1"/>');
      expect(html, userId).not.toMatch(/Trekk tilbake|>Godta<|>Avslå</);
    }
  });

  it("hver side ser hvem som har bekreftet: «Du» og den andres fornavn", async () => {
    await setStatus("accepted", { ownerConfirmed: true });

    const owner = (await visit("r1", OWNER_ID)).html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const buyer = (await visit("r1", "kari")).html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    expect(owner).toContain("Du Bekreftet Kari Ikke bekreftet");
    expect(buyer).toContain("Du Ikke bekreftet Ola Bekreftet");
  });

  it("den som har bekreftet, mister Bekreft overlevering men beholder Avbestill; den andre beholder begge", async () => {
    await setStatus("accepted", { requesterConfirmed: true });

    const buyer = (await visit("r1", "kari")).html;
    const owner = (await visit("r1", OWNER_ID)).html;

    expect(buyer).not.toContain("Bekreft overlevering</button>");
    expect(buyer).toContain(">Avbestill</button>");
    expect(owner).toContain(">Bekreft overlevering</button>");
  });

  it("ikke bekreftet vises ikke som fullført: i bruk og fullført har verken Bekreft, Avbestill eller bekreftelsesstatus", async () => {
    for (const status of ["in_use", "completed"] as const) {
      await setStatus(status, { ownerConfirmed: true, requesterConfirmed: true });
      for (const userId of [OWNER_ID, "kari"]) {
        const { html } = await visit("r1", userId);
        expect(html, `${status} ${userId}`).not.toMatch(/<button|bekreftet/i);
      }
    }
  });

  it("forespørreren kan trekke tilbake mens forespørselen venter, uansett hvis tur det er; eieren kan ikke", async () => {
    for (const status of ["waiting_owner", "waiting_requester"] as const) {
      await setStatus(status);
      expect((await visit("r1", "kari")).html, status).toMatch(/<button type="button"[^>]*>Trekk tilbake<\/button>/);
      expect((await visit("r1", OWNER_ID)).html, status).not.toContain("Trekk tilbake");
    }
  });

  it("avsluttede forespørsler har ikke Trekk tilbake, Avbestill eller Bekreft overlevering", async () => {
    for (const status of ["declined", "withdrawn", "expired", "cancelled"] as const) {
      await setStatus(status);
      for (const userId of [OWNER_ID, "kari"]) expect((await visit("r1", userId)).html, `${status} ${userId}`).not.toMatch(/Trekk tilbake<\/button>|Avbestill<\/button>|Bekreft overlevering/);
    }
  });

  it("meldingene etter bekreft, avbestill og trekk tilbake vises bare når statusen stemmer", async () => {
    const toast = (html: string) => html.match(/<div role="status"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";

    await setStatus("accepted", { ownerConfirmed: true });
    expect(toast((await visit("r1", OWNER_ID, "?sendt=bekreftet")).html)).toContain("Overlevering bekreftet");
    await setStatus("cancelled");
    expect(toast((await visit("r1", OWNER_ID, "?sendt=avbestilt")).html)).toContain("Avtalen er avbestilt");
    await setStatus("withdrawn");
    expect(toast((await visit("r1", "kari", "?sendt=trukket")).html)).toContain("Forespørselen er trukket tilbake");
    expect(toast((await visit("r1", "kari", "?sendt=avbestilt")).html)).toBe("");
  });
});

// Retur ved lån (FK-07, #214): bare eieren, bare mens lånet er i bruk.
describe("RequestPage, bekreft retur (#214)", () => {
  const returnButton = />Bekreft retur<\/button>/;
  const inUse = { status: "in_use", ownerConfirmed: true, requesterConfirmed: true } as const;

  beforeEach(async () => {
    await holder.db.insert(listing).values(validListing({ id: "tent", title: "Telt", type: "loan", price: 60 }));
    await holder.db.insert(request).values({ id: "rl", listingId: "tent", requesterId: "kari", ...inUse });
    await holder.db.insert(offer).values({ requestId: "rl", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19", createdAt: new Date("2026-10-17T01:12:00Z") });
  });

  it("eieren av et lån i bruk har Bekreft retur, og låneren har ingen knapper", async () => {
    const owner = (await visit("rl", OWNER_ID)).html;
    const buyer = (await visit("rl", "kari")).html;

    expect(owner).toMatch(returnButton);
    expect(owner).toContain('<input type="hidden" name="requestId" value="rl"/>');
    expect(owner).not.toMatch(/Bekreft overlevering|Avbestill|Trekk tilbake/);
    expect(buyer).not.toMatch(/<button|Bekreft retur/);
  });

  it("ingen Bekreft retur før lånet er i bruk, etter at det er levert, eller når det ikke er et lån", async () => {
    for (const status of ["waiting_owner", "waiting_requester", "accepted", "declined", "withdrawn", "expired", "cancelled", "completed"] as const) {
      await holder.db.update(request).set({ status }).where(eq(request.id, "rl"));
      expect((await visit("rl", OWNER_ID)).html, status).not.toMatch(returnButton);
    }
    await holder.db.update(request).set({ status: "in_use" }).where(eq(request.id, "r1"));
    expect((await visit("r1", OWNER_ID)).html).not.toMatch(returnButton);
  });

  it("en tredjepart får 404 og ingen knapp", async () => {
    const { html, status } = await visit("rl", "per");

    expect(status).toBe(404);
    expect(html).not.toMatch(returnButton);
  });

  it("et lån som ble i bruk av den automatiske bekreftelsen etter 3 dager, har Bekreft retur med en gang", async () => {
    await holder.db
      .update(request)
      .set({ status: "accepted", ownerConfirmed: false, requesterConfirmed: true, updatedAt: new Date("2026-10-14T12:00:00Z") })
      .where(eq(request.id, "rl"));

    expect((await visit("rl", OWNER_ID)).html).toMatch(returnButton);
    expect((await holder.db.select().from(request).where(eq(request.id, "rl")))[0].status).toBe("accepted");
  });

  it("meldingen «Retur bekreftet» vises bare når lånet er fullført", async () => {
    const toast = (html: string) => html.match(/<div role="status"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";

    expect(toast((await visit("rl", OWNER_ID, "?sendt=levert")).html)).toBe("");
    await holder.db.update(request).set({ status: "completed" }).where(eq(request.id, "rl"));
    expect(toast((await visit("rl", OWNER_ID, "?sendt=levert")).html)).toContain("Retur bekreftet");
  });
});

describe("RequestPage, ingen Historikk (#205)", () => {
  it("«Historikk» er navnet på fanen på Min side, så forespørselssiden har hverken panelet eller linjene, for noen av partene", async () => {
    await holder.db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date("2026-10-17T09:00:00Z") });
    await holder.db.update(request).set({ status: "waiting_requester" });

    for (const userId of [OWNER_ID, "kari"]) {
      const { html } = await visit("r1", userId);
      expect(html).not.toMatch(/Historikk|<h2|<ul|<li/);
      expect(html).not.toMatch(/bød \d|foreslo \d/);
    }
  });

  it("viser bare det siste forslaget, i budkortet", async () => {
    const { html } = await visit("r1", OWNER_ID);

    expect(html).toMatch(/Bud<\/dt><dd[^>]*>230\s*kr<\/dd>/);
    expect(html).not.toMatch(/220\s*kr/);
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

  it("lån: «Motbud sendt» med den nye perioden, og «Du godtok forespørselen»", async () => {
    await holder.db.insert(listing).values(validListing({ id: "tent", title: "Telt", type: "loan", price: 60 }));
    await holder.db.insert(request).values({ id: "rl", listingId: "tent", requesterId: "kari", status: "waiting_requester" });
    await holder.db.insert(offer).values([
      { requestId: "rl", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19", createdAt: new Date("2026-10-17T01:12:00Z") },
      { requestId: "rl", senderId: OWNER_ID, startDate: "2026-11-14", endDate: "2026-11-21", createdAt: new Date("2026-10-17T09:00:00Z") },
    ]);

    expect(toast((await visit("rl", OWNER_ID, "?sendt=motbud")).html)).toContain("Motbud sendt: 14.11 – 21.11");

    await holder.db.update(request).set({ status: "accepted" }).where(eq(request.id, "rl"));
    expect(toast((await visit("rl", "kari", "?sendt=godtatt")).html)).toContain("Du godtok forespørselen");
  });

  it("en tredjepart får 404 og ingen melding, selv med markør", async () => {
    const { html, status } = await visit("r1", "per", "?sendt=motbud");

    expect(status).toBe(404);
    expect(toast(html)).toBe("");
  });
});
