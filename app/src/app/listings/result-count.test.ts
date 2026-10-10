// Knappeteksten for «Vis X annonser» (#102). Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { showResultsLabel } from "./result-count";

describe("showResultsLabel", () => {
  it("viser antallet, entall for én, og uten tall når antallet er ukjent", () => {
    expect(showResultsLabel(14)).toBe("Vis 14 annonser");
    expect(showResultsLabel(1)).toBe("Vis 1 annonse");
    expect(showResultsLabel(0)).toBe("Vis 0 annonser");
    expect(showResultsLabel(null)).toBe("Vis annonser");
  });
});
