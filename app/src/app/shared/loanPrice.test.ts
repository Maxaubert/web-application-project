import { describe, expect, it } from "vitest";
import { loanPrice } from "./loanPrice";

describe("loanPrice", () => {
  it("regner dagspris som ukepris delt på 7", () => {
    expect(loanPrice(70, 3)).toBe(30);
  });

  it("gir full ukepris for 7 dager", () => {
    expect(loanPrice(140, 7)).toBe(140);
  });

  it("er gratis uten ukepris", () => {
    expect(loanPrice(null, 5)).toBe(0);
  });

  it("avviser null eller negative dager", () => {
    expect(() => loanPrice(70, 0)).toThrow();
    expect(() => loanPrice(70, -2)).toThrow();
  });
});
