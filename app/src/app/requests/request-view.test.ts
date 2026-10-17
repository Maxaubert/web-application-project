// Tekstene på forespørselssiden: banneret per status og rolle, etiketten over budet og linjene i historikken.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { bannerFor, formatWhen, historyLine, offerLabel } from "./request-view";

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

describe("historyLine", () => {
  const at = new Date("2026-10-17T01:12:00Z");

  it("sier «Du» om deg selv og navnet om den andre", () => {
    const bid = { senderId: "kari", price: 230, createdAt: at };
    expect(historyLine(bid, "kari", "kari", names)).toBe("17.10 kl. 03:12 · Du bød 230 kr");
    expect(historyLine(bid, "ola", "kari", names)).toBe("17.10 kl. 03:12 · Kari Hansen bød 230 kr");
  });

  it("selgerens forslag heter «foreslo»", () => {
    const counter = { senderId: "ola", price: 240, createdAt: at };
    expect(historyLine(counter, "kari", "kari", names)).toBe("17.10 kl. 03:12 · Ola Nordmann foreslo 240 kr");
    expect(historyLine(counter, "ola", "kari", names)).toBe("17.10 kl. 03:12 · Du foreslo 240 kr");
  });

  it("tusenskille på store beløp", () => {
    const line = historyLine({ senderId: "kari", price: 12500, createdAt: at }, "kari", "kari", names);
    expect(line.replace(/\s/g, " ")).toContain("12 500 kr");
  });
});
