// Demoannonsene i scripts/seed-listings.json (#152) skal være gyldige etter de samme reglene som skjemaet,
// ha en eier blant demobrukerne og ha bilder. Godkjent av Max 11.10.
import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import data from "../../../scripts/seed-listings.json";
import { validateListing } from "./listing-schema";

describe("demoannonsene", () => {
  it("er 34, med unike slugs, og hver består skjemaets validering", () => {
    expect(data.listings).toHaveLength(34);
    expect(new Set(data.listings.map((l) => l.slug)).size).toBe(34);
    for (const l of data.listings) {
      const result = validateListing({ ...l, price: l.price === null ? "" : String(l.price) });
      expect(result.success, `${l.slug}: ${JSON.stringify(result.success ? "" : result.fieldErrors)}`).toBe(true);
    }
  });

  it("eies av en demobruker og har 1–10 bilder i seed-images", () => {
    const owners = new Set(data.users.map((u) => u.id));
    for (const l of data.listings) {
      expect(owners.has(l.owner), l.slug).toBe(true);
      const dir = `scripts/seed-images/${l.slug}`;
      const count = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".jpg")).length : 0;
      expect(count, l.slug).toBeGreaterThanOrEqual(1);
      expect(count, l.slug).toBeLessThanOrEqual(10);
    }
  });
});
