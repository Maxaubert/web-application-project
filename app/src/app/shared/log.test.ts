// Maskering av e-post i loggen. Godkjent av Max 05.10.
import { describe, expect, it } from "vitest";
import { maskEmail } from "./log";

describe("maskEmail", () => {
  it("viser bare første tegn og domenet", () => {
    expect(maskEmail("ola@hiof.no")).toBe("o***@hiof.no");
  });

  it("skjuler alt når det ikke er en e-postadresse", () => {
    expect(maskEmail("ikke-epost")).toBe("***");
  });
});
