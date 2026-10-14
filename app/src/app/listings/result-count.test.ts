// Knappeteksten for «Vis X annonser» (#102). Godkjent av Max 10.10.
import { describe, expect, it } from "vitest";
import { showResultsLabel } from "./result-count";

describe("showResultsLabel", () => {
  it("viser antallet, med entall for én", () => {
    expect(showResultsLabel(14)).toBe("Vis 14 annonser");
    expect(showResultsLabel(1)).toBe("Vis 1 annonse");
    expect(showResultsLabel(0)).toBe("Vis 0 annonser");
  });
});
