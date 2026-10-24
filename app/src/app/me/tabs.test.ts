// Fanen på Min side leses fra adressen (#224). Godkjent av Max 24.10.
import { describe, expect, it } from "vitest";
import { parseTab } from "./tabs";

describe("parseTab", () => {
  it("gir Mine annonser for listings, Mine favoritter for favorites, ellers Forespørsler", () => {
    expect(parseTab("listings")).toBe("listings");
    expect(parseTab("favorites")).toBe("favorites");
    expect(parseTab(null)).toBe("requests");
    expect(parseTab("requests")).toBe("requests");
    expect(parseTab("ukjent")).toBe("requests");
  });
});
