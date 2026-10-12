// Bla i galleriet på annonsesiden (#156): rundtur.
import { describe, expect, it } from "vitest";
import { stepIndex } from "./gallery-step";

describe("stepIndex", () => {
  it("går ett bilde fram og tilbake", () => {
    expect(stepIndex(1, 1, 4)).toBe(2);
    expect(stepIndex(2, -1, 4)).toBe(1);
  });

  it("gjør rundtur: etter siste kommer første, og før første kommer siste", () => {
    expect(stepIndex(3, 1, 4)).toBe(0);
    expect(stepIndex(0, -1, 4)).toBe(3);
  });

  it("står stille med ett bilde og gir 0 uten bilder", () => {
    expect(stepIndex(0, 1, 1)).toBe(0);
    expect(stepIndex(0, -1, 1)).toBe(0);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});
