// Bla i galleriet på annonsesiden (#156): rundtur og sveip.
import { describe, expect, it } from "vitest";
import { stepIndex, swipeDirection } from "./gallery-step";

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

describe("swipeDirection", () => {
  it("sveip mot venstre er neste bilde, mot høyre forrige", () => {
    expect(swipeDirection(-80, 5)).toBe(1);
    expect(swipeDirection(80, -5)).toBe(-1);
  });

  it("korte bevegelser og trykk er ikke sveip", () => {
    expect(swipeDirection(39, 0)).toBeNull();
    expect(swipeDirection(-39, 0)).toBeNull();
    expect(swipeDirection(0, 0)).toBeNull();
  });

  it("40 piksler er nok", () => {
    expect(swipeDirection(-40, 0)).toBe(1);
  });

  it("rulling opp og ned er ikke sveip, selv med litt sidelengs bevegelse", () => {
    expect(swipeDirection(60, 100)).toBeNull();
    expect(swipeDirection(60, 41)).toBeNull();
    expect(swipeDirection(61, 40)).toBe(-1);
  });
});
