// Delingen og sorteringen av forespørslene på Min side (#193).
import { describe, expect, it } from "vitest";
import type { Listing } from "@/db/schema";
import type { MyRequest } from "@/app/requests/queries";
import { parseShow, splitRequests } from "./my-requests";

function item(id: string, overrides: Partial<MyRequest> = {}): MyRequest {
  return {
    id,
    status: "waiting_owner",
    role: "owner",
    listing: { id: `l-${id}` } as Listing,
    coverKey: null,
    otherName: "Kari Hansen",
    price: 200,
    changedAt: new Date("2026-10-17T10:00:00Z"),
    ...overrides,
  };
}

describe("parseShow", () => {
  it("«sent» gir Sendt, alt annet gir Mottatt", () => {
    expect(parseShow("sent")).toBe("sent");
    for (const value of [null, "", "received", "SENT", "sent ", "alle"]) expect(parseShow(value)).toBe("received");
  });
});

describe("splitRequests", () => {
  it("eierens forespørsler er mottatt, og de egne er sendt", () => {
    const { received, sent } = splitRequests([item("a", { role: "owner" }), item("b", { role: "requester" }), item("c", { role: "owner" })]);

    expect(received.map((r) => r.id).sort()).toEqual(["a", "c"]);
    expect(sent.map((r) => r.id)).toEqual(["b"]);
  });

  it("gir tomme lister uten forespørsler", () => {
    expect(splitRequests([])).toEqual({ received: [], sent: [], history: [] });
  });

  it("de der det er din tur kommer først, også når de er eldre", () => {
    const old = new Date("2026-10-01T10:00:00Z");
    const recent = new Date("2026-10-17T10:00:00Z");
    const { received } = splitRequests([
      item("venter", { status: "waiting_requester", changedAt: recent }),
      item("din-tur", { status: "waiting_owner", changedAt: old }),
      item("avtalt", { status: "accepted", changedAt: recent }),
    ]);

    expect(received.map((r) => r.id)).toEqual(["din-tur", "venter", "avtalt"]);
  });

  it("innenfor samme gruppe kommer nyeste endring først", () => {
    const { sent } = splitRequests([
      item("eldst", { role: "requester", status: "accepted", changedAt: new Date("2026-10-01T10:00:00Z") }),
      item("nyest", { role: "requester", status: "in_use", changedAt: new Date("2026-10-17T10:00:00Z") }),
      item("midt", { role: "requester", status: "accepted", changedAt: new Date("2026-10-09T10:00:00Z") }),
    ]);

    expect(sent.map((r) => r.id)).toEqual(["nyest", "midt", "eldst"]);
  });

  it("«din tur» avhenger av rollen: samme status er din tur for selgeren, ikke for kjøperen", () => {
    const { received, sent } = splitRequests([
      item("s1", { role: "owner", status: "waiting_owner", changedAt: new Date("2026-10-01T00:00:00Z") }),
      item("s2", { role: "owner", status: "accepted", changedAt: new Date("2026-10-17T00:00:00Z") }),
      item("k1", { role: "requester", status: "waiting_owner", changedAt: new Date("2026-10-01T00:00:00Z") }),
      item("k2", { role: "requester", status: "waiting_requester", changedAt: new Date("2026-10-02T00:00:00Z") }),
    ]);

    expect(received.map((r) => r.id)).toEqual(["s1", "s2"]);
    expect(sent.map((r) => r.id)).toEqual(["k2", "k1"]);
  });

  it("endrer ikke listen den får inn", () => {
    const input = [item("a", { changedAt: new Date("2026-10-01T00:00:00Z") }), item("b", { changedAt: new Date("2026-10-17T00:00:00Z") })];

    splitRequests(input);

    expect(input.map((r) => r.id)).toEqual(["a", "b"]);
  });

  // Historikk (#220, Max 01.11). Godkjent av Max 01.11.
  it("Mottatt og Sendt har bare pågående; Historikk har alle avsluttede fra begge roller, nyeste først", () => {
    const at = (day: string) => new Date(`2026-10-${day}T10:00:00Z`);
    const { received, sent, history } = splitRequests([
      item("venter", { role: "owner", status: "waiting_owner", changedAt: at("20") }),
      item("avtalt", { role: "requester", status: "accepted", changedAt: at("19") }),
      item("i-bruk", { role: "owner", status: "in_use", changedAt: at("18") }),
      item("fullfort", { role: "owner", status: "completed", changedAt: at("17") }),
      item("avslatt", { role: "requester", status: "declined", changedAt: at("21") }),
      item("trukket", { role: "requester", status: "withdrawn", changedAt: at("15") }),
      item("utlopt", { role: "owner", status: "expired", changedAt: at("16") }),
      item("avbestilt", { role: "requester", status: "cancelled", changedAt: at("14") }),
    ]);

    expect(received.map((r) => r.id)).toEqual(["venter", "i-bruk"]);
    expect(sent.map((r) => r.id)).toEqual(["avtalt"]);
    expect(history.map((r) => r.id)).toEqual(["avslatt", "fullfort", "utlopt", "trukket", "avbestilt"]);
  });
});
