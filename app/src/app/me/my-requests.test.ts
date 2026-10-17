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

  it("gir to tomme lister uten forespørsler", () => {
    expect(splitRequests([])).toEqual({ received: [], sent: [] });
  });

  it("de der det er din tur kommer først, også når de er eldre", () => {
    const old = new Date("2026-10-01T10:00:00Z");
    const recent = new Date("2026-10-17T10:00:00Z");
    const { received } = splitRequests([
      item("venter", { status: "waiting_requester", changedAt: recent }),
      item("din-tur", { status: "waiting_owner", changedAt: old }),
      item("avsluttet", { status: "declined", changedAt: recent }),
    ]);

    expect(received.map((r) => r.id)).toEqual(["din-tur", "venter", "avsluttet"]);
  });

  it("innenfor samme gruppe kommer nyeste endring først", () => {
    const { sent } = splitRequests([
      item("eldst", { role: "requester", status: "declined", changedAt: new Date("2026-10-01T10:00:00Z") }),
      item("nyest", { role: "requester", status: "declined", changedAt: new Date("2026-10-17T10:00:00Z") }),
      item("midt", { role: "requester", status: "declined", changedAt: new Date("2026-10-09T10:00:00Z") }),
    ]);

    expect(sent.map((r) => r.id)).toEqual(["nyest", "midt", "eldst"]);
  });

  it("«din tur» avhenger av rollen: samme status er din tur for selgeren, ikke for kjøperen", () => {
    const { received, sent } = splitRequests([
      item("s1", { role: "owner", status: "waiting_owner", changedAt: new Date("2026-10-01T00:00:00Z") }),
      item("s2", { role: "owner", status: "declined", changedAt: new Date("2026-10-17T00:00:00Z") }),
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
});
