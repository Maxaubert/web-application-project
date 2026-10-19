// Min side /me (WF-09, #193) mot SQLite i minnet: profilen, Mottatt og Sendt, radene og rekkefølgen.
// Siden viser bare den innloggedes egne forespørsler og egen kontaktinfo. Godkjent av Max 17.10.
import { renderToStaticMarkup } from "react-dom/server";
import type { RequestInfo } from "rwsdk/worker";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listing, listingImage, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { OWNER_ID, validListing } from "@/test/test-listings";
import { MyPage } from "./MyPage";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

async function visit(userId: string, query = "") {
  const ctx = { session: { userId } } as RequestInfo["ctx"];
  const request = new Request(`https://studentmarkedet.test/me${query}`);
  return renderToStaticMarkup(await MyPage({ ctx, request } as RequestInfo));
}

// Klokken står stille: forespørsler utløper etter 7 dager (#187), og datoene under skal ikke bli for gamle.
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-18T12:00:00Z"));
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: OWNER_ID, name: "Ola Nordmann", email: "ola@hiof.no", phone: "+4790000001" },
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4791234567" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no", phone: "+4790000003" },
  ]);
  await holder.db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator", price: 250 }));
  await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", updatedAt: new Date("2026-10-17T01:20:00Z") });
  await holder.db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 230, createdAt: new Date("2026-10-17T01:20:00Z") });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Min side, innholdet", () => {
  it("viser tittel, profil med formatert telefon, og fanen Forespørsler", async () => {
    const html = await visit("kari");

    expect(html).toContain("<title>Min side – Studentmarkedet</title>");
    expect(html).toMatch(/<h1[^>]*>Min side<\/h1>/);
    for (const text of ["Kari Hansen", "kari@hiof.no", "+47 91 23 45 67"]) expect(html).toContain(text);
    expect(html).toMatch(/<a href="\/me" aria-current="page"[^>]*>Forespørsler<\/a>/);
  });

  it("viser aldri en annen brukers e-post eller telefon", async () => {
    const html = await visit("kari");

    expect(html).not.toMatch(/ola@hiof\.no|per@hiof\.no|\+4790000001|\+47 90 00 00 01/);
  });

  it("«Min side» i toppen er markert som siden man står på", async () => {
    expect(await visit("kari")).toMatch(/<a href="\/me"[^>]*aria-current="page"[^>]*>[\s\S]*?Min side<\/span>/);
  });

  it("har ingen forklaringstekst, bare tittel, profil, faner, tellere og rader", async () => {
    const html = await visit("kari");

    expect(html).not.toMatch(/Her ser du|Her finner du|Velkommen/);
  });
});

describe("Min side, selgeren (Mottatt)", () => {
  it("viser forespørselen med kjøperen, siste bud, type og «Din tur», som lenke til forespørselssiden", async () => {
    const html = await visit(OWNER_ID);

    expect(html).toMatch(/<a href="\/requests\/r1"[^>]*>Kalkulator<\/a>/);
    for (const text of ["Kari Hansen · 230 kr", "Salg", "17.10 kl. 03:20", "Din tur"]) expect(html.replace(/\s/g, " ")).toContain(text);
    expect(html).not.toContain("Til Kari Hansen");
  });

  it("raden viser miniatyren av forsidebildet, og plassholderen når annonsen ikke har bilde", async () => {
    await holder.db.insert(listingImage).values({ listingId: "calc", key: "listings/calc/a.jpg", position: 0 });

    expect(await visit(OWNER_ID)).toMatch(/<img src="\/images\/listings\/calc\/a\.thumb\.jpg"/);

    await holder.db.delete(listingImage);
    expect(await visit(OWNER_ID)).not.toContain("<img");
  });

  it("tellerne viser antall mottatt og sendt, og Mottatt er valgt som standard", async () => {
    const html = await visit(OWNER_ID);

    expect(html).toMatch(/<a href="\/me" aria-current="page"[^>]*>Mottatt \(1\)<\/a>/);
    expect(html).toMatch(/<a href="\/me\?show=sent"(?![^>]*aria-current)[^>]*>Sendt \(0\)<\/a>/);
  });

  it("Sendt er tom for selgeren, med tekst og vei til annonsene", async () => {
    const html = await visit(OWNER_ID, "?show=sent");

    expect(html).toContain("Du har ikke sendt noen forespørsler");
    expect(html).toMatch(/<a href="\/"[^>]*>Se annonser<\/a>/);
    expect(html).not.toContain("Kalkulator");
    expect(html).toMatch(/<a href="\/me\?show=sent" aria-current="page"[^>]*>Sendt \(0\)<\/a>/);
  });

  it("«Din tur» er en mørk chip, og avsluttede statuser er lyse chips med statusen", async () => {
    expect(await visit(OWNER_ID)).toMatch(/<span class="[^"]*bg-action[^"]*">Din tur<\/span>/);

    await holder.db.update(request).set({ status: "declined" });
    const html = await visit(OWNER_ID);

    expect(html).toMatch(/<span class="[^"]*">Avslått<\/span>/);
    expect(html).not.toMatch(/<span class="[^"]*bg-action[^"]*">Avslått<\/span>/);
    expect(html).not.toContain("Din tur");
  });
});

describe("Min side, kjøperen (Sendt)", () => {
  it("viser forespørselen under Sendt med selgeren, «Til» og «Selgers tur»", async () => {
    const html = await visit("kari", "?show=sent");

    expect(html).toMatch(/<a href="\/requests\/r1"[^>]*>Kalkulator<\/a>/);
    expect(html.replace(/\s/g, " ")).toContain("Til Ola Nordmann · 230 kr");
    expect(html).toContain("Selgers tur");
    expect(html).toMatch(/Mottatt \(0\)/);
    expect(html).toMatch(/Sendt \(1\)/);
  });

  it("Mottatt er tom for kjøperen, og et ukjent ?show gir Mottatt", async () => {
    for (const query of ["", "?show=alle", "?show="]) {
      const html = await visit("kari", query);

      expect(html).toContain("Du har ikke mottatt noen forespørsler");
      expect(html).not.toContain("Kalkulator");
    }
  });

  it("etter et motforslag har kjøperen tur og selgeren venter", async () => {
    await holder.db.update(request).set({ status: "waiting_requester" });

    expect(await visit("kari", "?show=sent")).toContain("Din tur");
    const owner = await visit(OWNER_ID);
    expect(owner).toContain("Kjøpers tur");
    expect(owner).not.toContain("Din tur");
  });
});

describe("Min side, alle andre", () => {
  it("en bruker uten forespørsler ser tomme lister og ingen andres annonser", async () => {
    const html = await visit("per");

    expect(html).toContain("Du har ikke mottatt noen forespørsler");
    expect(html).toMatch(/Mottatt \(0\)/);
    expect(html).toMatch(/Sendt \(0\)/);
    expect(html).not.toMatch(/Kalkulator|Kari Hansen|230/);
  });
});

describe("Min side, rekkefølgen", () => {
  it("«Din tur» kommer først, så nyeste endring", async () => {
    await holder.db.insert(listing).values([
      validListing({ id: "lamp", title: "Lampe", price: 90 }),
      validListing({ id: "bok", title: "Kokebok", price: 60 }),
    ]);
    await holder.db.insert(request).values([
      { id: "r2", listingId: "lamp", requesterId: "per", status: "declined", updatedAt: new Date("2026-10-18T10:00:00Z") },
      { id: "r3", listingId: "bok", requesterId: "per", status: "waiting_owner", updatedAt: new Date("2026-10-14T10:00:00Z") },
    ]);
    await holder.db.insert(offer).values([
      { requestId: "r2", senderId: "per", price: 80, createdAt: new Date("2026-10-18T10:00:00Z") },
      { requestId: "r3", senderId: "per", price: 50, createdAt: new Date("2026-10-14T10:00:00Z") },
    ]);

    const html = await visit(OWNER_ID);

    // Kalkulator (din tur, 17.10), Kokebok (din tur, 14.10), Lampe (avslått, 18.10 men uten tur).
    expect(html.indexOf("Kalkulator")).toBeLessThan(html.indexOf("Kokebok"));
    expect(html.indexOf("Kokebok")).toBeLessThan(html.indexOf("Lampe"));
  });
});
