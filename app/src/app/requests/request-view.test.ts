// Tekstene på forespørselssiden: banneret per status og rolle, etiketten over budet og klokkeslettet.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { bannerFor, chipFor, formatWhen, offerLabel } from "./request-view";

const names = { ownerName: "Ola Nordmann", requesterName: "Kari Hansen" };

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
