// Søket leses fra adressen og valideres på serveren. Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { parseSearch } from "./search-params";

function search(query: string) {
  return parseSearch(new URL(`http://localhost/${query}`));
}

describe("parseSearch", () => {
  it("leser søkeordet og fjerner mellomrom rundt det, og tom adresse betyr tomt søk", () => {
    expect(search("?q=%20kalk%20")).toMatchObject({ success: true, data: { q: "kalk" } });
    expect(search("")).toMatchObject({ success: true, data: { q: "" } });
  });

  it("avviser søk over 100 tegn, men godtar akkurat 100", () => {
    expect(search(`?q=${"a".repeat(101)}`).success).toBe(false);
    expect(search(`?q=${"a".repeat(100)}`).success).toBe(true);
  });
});
