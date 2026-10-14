// Ren logikk for live søkeforslag (#104). Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { moveActive, suggestionsUrl } from "./suggestions";

describe("suggestionsUrl", () => {
  it("henter ikke før to tegn, og koder søkeordet i adressen", () => {
    expect(suggestionsUrl("k")).toBeNull();
    expect(suggestionsUrl("  k ")).toBeNull();
    expect(suggestionsUrl("ø l")).toBe("/api/listings?q=%C3%B8%20l&limit=5");
  });
});

describe("moveActive", () => {
  it("markeringen ruller rundt i begge retninger", () => {
    expect(moveActive(-1, 1, 3)).toBe(0);
    expect(moveActive(-1, -1, 3)).toBe(2);
    expect(moveActive(2, 1, 3)).toBe(0);
    expect(moveActive(0, -1, 3)).toBe(2);
    expect(moveActive(0, 1, 0)).toBe(-1);
  });
});
