// Tekstene på forespørselssiden: banneret per status og rolle, etiketten over budet og klokkeslettet.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { bannerFor, chipFor, formatPeriod, formatWhen, noticeFor, noticeMarkers, offerLabel } from "./request-view";

const names = { ownerName: "Ola Nordmann", requesterName: "Kari Hansen" };

describe("formatPeriod (#186)", () => {
  it("skriver dag og måned for begge datoene, uten år", () => {
    expect(formatPeriod("2026-11-12", "2026-11-19")).toBe("12.11 – 19.11");
    expect(formatPeriod("2026-12-28", "2027-01-04")).toBe("28.12 – 04.01");
  });
});

describe("bannerFor, lån og gis bort (#186)", () => {
  it("eieren ser «Ny forespørsel» i stedet for «Nytt bud», og det er hens tur", () => {
    for (const type of ["loan", "giveaway"] as const) {
      expect(bannerFor("waiting_owner", "owner", names, type)).toEqual({ text: "Ny forespørsel fra Kari Hansen", yourTurn: true });
    }
    expect(bannerFor("waiting_owner", "owner", names, "sale").text).toBe("Nytt bud fra Kari Hansen");
  });

  it("kjøperen ser det samme som for salg", () => {
    expect(bannerFor("waiting_owner", "requester", names, "loan")).toEqual({ text: "Venter på svar fra Ola Nordmann", yourTurn: false });
  });
});

describe("bannerFor", () => {
  it("selgeren ser «Nytt bud» og har tur, kjøperen venter", () => {
    expect(bannerFor("waiting_owner", "owner", names)).toEqual({ text: "Nytt bud fra Kari Hansen", yourTurn: true });
    expect(bannerFor("waiting_owner", "requester", names)).toEqual({ text: "Venter på svar fra Ola Nordmann", yourTurn: false });
  });

  it("etter et motforslag er det kjøperens tur", () => {
    expect(bannerFor("waiting_requester", "requester", names)).toEqual({ text: "Motforslag fra Ola Nordmann", yourTurn: true });
    expect(bannerFor("waiting_requester", "owner", names)).toEqual({ text: "Venter på svar fra Kari Hansen", yourTurn: false });
  });

  it("de avsluttede statusene har en tekst, og ingen har tur", () => {
    const expected = {
      accepted: "Avtalt",
      declined: "Avslått",
      withdrawn: "Trukket tilbake",
      expired: "Utløpt",
      cancelled: "Avbestilt",
      in_use: "I bruk",
      completed: "Fullført",
    };
    for (const status of requestStatuses.filter((s) => !s.startsWith("waiting"))) {
      for (const role of ["owner", "requester"] as const) {
        expect(bannerFor(status, role, names)).toEqual({ text: expected[status as keyof typeof expected], yourTurn: false });
      }
    }
  });
});

describe("chipFor", () => {
  it("når budet venter på selgeren: «Din tur» for selgeren, «Selgers tur» for kjøperen", () => {
    expect(chipFor("waiting_owner", "owner")).toEqual({ text: "Din tur", yourTurn: true });
    expect(chipFor("waiting_owner", "requester")).toEqual({ text: "Selgers tur", yourTurn: false });
  });

  it("etter et motforslag: «Din tur» for kjøperen, «Kjøpers tur» for selgeren", () => {
    expect(chipFor("waiting_requester", "requester")).toEqual({ text: "Din tur", yourTurn: true });
    expect(chipFor("waiting_requester", "owner")).toEqual({ text: "Kjøpers tur", yourTurn: false });
  });

  it("de avsluttede og pågående statusene viser statusen, og ingen har tur", () => {
    const expected = {
      accepted: "Avtalt",
      declined: "Avslått",
      withdrawn: "Trukket tilbake",
      expired: "Utløpt",
      cancelled: "Avbestilt",
      in_use: "I bruk",
      completed: "Fullført",
    };
    for (const status of requestStatuses.filter((s) => !s.startsWith("waiting"))) {
      for (const role of ["owner", "requester"] as const) {
        expect(chipFor(status, role)).toEqual({ text: expected[status as keyof typeof expected], yourTurn: false });
      }
    }
  });
});

describe("offerLabel", () => {
  it("kjøperens bud er «Bud» for selgeren og «Ditt bud» for kjøperen", () => {
    expect(offerLabel({ senderId: "kari" }, "ola", "kari")).toBe("Bud");
    expect(offerLabel({ senderId: "kari" }, "kari", "kari")).toBe("Ditt bud");
  });

  it("selgerens forslag er «Motbud» for kjøperen og «Ditt motbud» for selgeren", () => {
    expect(offerLabel({ senderId: "ola" }, "kari", "kari")).toBe("Motbud");
    expect(offerLabel({ senderId: "ola" }, "ola", "kari")).toBe("Ditt motbud");
  });
});

describe("formatWhen", () => {
  it("viser norsk tid, også når serveren går i UTC (sommertid og vintertid)", () => {
    expect(formatWhen(new Date("2026-10-17T01:12:00Z"))).toBe("17.10 kl. 03:12");
    expect(formatWhen(new Date("2026-12-24T23:30:00Z"))).toBe("25.12 kl. 00:30");
  });
});


describe("noticeFor", () => {
  const mine = { senderId: "ola", price: 12500, startDate: null, endDate: null };
  const myPeriod = { senderId: "ola", price: null, startDate: "2026-11-14", endDate: "2026-11-21" };

  it("«motbud»: «Motbud sendt» med beløpet, når siste forslag er ditt og forespørselen venter", () => {
    for (const status of ["waiting_owner", "waiting_requester"] as const) {
      expect(noticeFor("motbud", status, mine, "ola")?.replace(/\s/g, " "), status).toBe("Motbud sendt: 12 500 kr");
    }
  });

  it("«motbud»: ingen melding når siste forslag er den andres, har ingen pris, mangler, eller forespørselen er avsluttet", () => {
    expect(noticeFor("motbud", "waiting_requester", mine, "kari")).toBeNull();
    expect(noticeFor("motbud", "waiting_requester", { ...mine, price: null }, "ola")).toBeNull();
    expect(noticeFor("motbud", "waiting_requester", undefined, "ola")).toBeNull();
    for (const status of ["accepted", "declined", "expired", "withdrawn"] as const) {
      expect(noticeFor("motbud", status, mine, "ola"), status).toBeNull();
    }
  });

  it("«godtatt» og «avslatt» gir meldingen bare når statusen stemmer", () => {
    expect(noticeFor("godtatt", "accepted", mine, "ola")).toBe("Du godtok budet");
    expect(noticeFor("avslatt", "declined", mine, "ola")).toBe("Forespørselen er avslått");
    for (const status of requestStatuses.filter((s) => s !== "accepted")) expect(noticeFor("godtatt", status, mine, "ola"), status).toBeNull();
    for (const status of requestStatuses.filter((s) => s !== "declined")) expect(noticeFor("avslatt", status, mine, "ola"), status).toBeNull();
  });

  it("lån (#208): «Motbud sendt» med perioden, og ingenting uten periode, med en annens forslag eller på en avsluttet forespørsel", () => {
    expect(noticeFor("motbud", "waiting_requester", myPeriod, "ola", "loan")).toBe("Motbud sendt: 14.11 – 21.11");
    expect(noticeFor("motbud", "waiting_requester", mine, "ola", "loan")).toBeNull();
    expect(noticeFor("motbud", "waiting_requester", myPeriod, "kari", "loan")).toBeNull();
    expect(noticeFor("motbud", "declined", myPeriod, "ola", "loan")).toBeNull();
  });

  it("«godtatt» sier «Du godtok forespørselen» for lån og gis bort, og «Du godtok budet» for salg", () => {
    expect(noticeFor("godtatt", "accepted", myPeriod, "ola", "loan")).toBe("Du godtok forespørselen");
    expect(noticeFor("godtatt", "accepted", myPeriod, "ola", "giveaway")).toBe("Du godtok forespørselen");
    expect(noticeFor("godtatt", "accepted", mine, "ola", "sale")).toBe("Du godtok budet");
    expect(noticeFor("godtatt", "waiting_owner", myPeriod, "ola", "loan")).toBeNull();
  });

  it("«bekreftet» gjelder godtatt, i bruk og fullført, fordi den siste bekreftelsen flytter avtalen videre", () => {
    for (const status of ["accepted", "in_use", "completed"] as const) expect(noticeFor("bekreftet", status, mine, "ola"), status).toBe("Overlevering bekreftet");
    for (const status of requestStatuses.filter((s) => !["accepted", "in_use", "completed"].includes(s))) expect(noticeFor("bekreftet", status, mine, "ola"), status).toBeNull();
  });

  it("«avbestilt» og «trukket» gir meldingen bare når statusen stemmer", () => {
    expect(noticeFor("avbestilt", "cancelled", mine, "ola")).toBe("Avtalen er avbestilt");
    expect(noticeFor("trukket", "withdrawn", mine, "ola")).toBe("Forespørselen er trukket tilbake");
    for (const status of requestStatuses.filter((s) => s !== "cancelled")) expect(noticeFor("avbestilt", status, mine, "ola"), status).toBeNull();
    for (const status of requestStatuses.filter((s) => s !== "withdrawn")) expect(noticeFor("trukket", status, mine, "ola"), status).toBeNull();
  });

  it("ingen markør, en ukjent markør og en tom markør gir ingen melding", () => {
    for (const marker of [null, "", "annet", "MOTBUD", "motbud "]) {
      expect(noticeFor(marker, "waiting_requester", mine, "ola"), String(marker)).toBeNull();
    }
  });

  it("markørene serverhandlingen setter, er de som siden leser", () => {
    expect(noticeMarkers).toEqual({
      counter: "motbud",
      accept: "godtatt",
      decline: "avslatt",
      confirm: "bekreftet",
      cancel: "avbestilt",
      withdraw: "trukket",
    });
  });
});
