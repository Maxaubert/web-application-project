// Adressene skjemaet og «Vis X annonser» bruker (#102). Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { countUrl, searchPageUrl } from "./search-url";

describe("searchPageUrl og countUrl", () => {
  it("tar med gjentatte avkrysninger, koder søkeordet og dropper tomme felt", () => {
    const entries: [string, string][] = [
      ["q", "kalk & co"],
      ["category", ""],
      ["type", "sale"],
      ["type", "loan"],
      ["minPrice", ""],
    ];
    expect(searchPageUrl(entries)).toBe("/?q=kalk+%26+co&type=sale&type=loan");
    expect(countUrl(entries)).toBe("/api/listings?q=kalk+%26+co&type=sale&type=loan");
  });

  it("bare tomme felt gir forsiden uten spørsmålstegn", () => {
    expect(searchPageUrl([["q", ""], ["category", ""]])).toBe("/");
  });
});
