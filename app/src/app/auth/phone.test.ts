// formatPhone (#193): nummeret på Min side vises med mellomrom, og ukjent format vises som det er.
import { describe, expect, it } from "vitest";
import { formatPhone } from "./phone";

describe("formatPhone", () => {
  it("skriver et norsk nummer med landskode og mellomrom", () => {
    expect(formatPhone("+4791234567")).toBe("+47 91 23 45 67");
  });

  it("skriver et utenlandsk nummer med sin landskode", () => {
    expect(formatPhone("+46701234567")).toBe("+46 70 123 45 67");
  });

  it("viser en tekst som ikke er et nummer uendret, uten å feile", () => {
    expect(formatPhone("ikke et nummer")).toBe("ikke et nummer");
    expect(formatPhone("")).toBe("");
  });
});
