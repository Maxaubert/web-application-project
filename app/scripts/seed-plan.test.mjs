// Demoannonsene (#152): SQL og R2-nøkler fra seed-listings.json. Godkjent av Max 11.10.
import { describe, expect, it } from "vitest";
import { DEMO_EMAIL_DOMAIN, removePlan, seedPlan, stableId } from "./seed-plan.mjs";

const data = {
  users: [
    { id: "demo-a", name: "Ola O'Brien" },
    { id: "demo-it", name: "Skolens IT-avdeling" },
  ],
  listings: [
    { slug: "lampe", owner: "demo-a", type: "sale", title: "Lampe", description: "Med «LED».", category: "furniture", condition: "used", price: 100 },
    { slug: "skjerm", owner: "demo-it", type: "loan", title: "Skjerm", description: "Gratis.", category: "electronics", condition: "used", price: null },
  ],
};
const images = { lampe: ["02.jpg", "01.jpg"], skjerm: [] };

describe("seedPlan", () => {
  it("sletter bare det demobrukerne eier, før noe legges inn", () => {
    const { sql } = seedPlan(data, images);
    const deletes = sql.split("\n").filter((line) => line.startsWith("DELETE"));

    expect(deletes).toHaveLength(3);
    for (const line of deletes) expect(line).toContain("IN ('demo-a', 'demo-it')");
    expect(sql.indexOf("DELETE")).toBe(0);
    expect(sql.lastIndexOf("DELETE")).toBeLessThan(sql.indexOf("INSERT"));
  });

  it("gir demobrukerne adresser som ikke kan logge inn, og escaper anførselstegn", () => {
    const { sql } = seedPlan(data, images);

    expect(sql).toContain(`'demo-1@${DEMO_EMAIL_DOMAIN}'`);
    expect(sql).not.toMatch(/@hiof\.no/);
    expect(sql).toContain("'Ola O''Brien'");
    expect(sql).toContain("'Skjerm', 'Gratis.', 'electronics', 'used', NULL, 'active');");
  });

  it("legger bildene i filnavnrekkefølge med 01 som forsidebilde, og samme nøkler hver gang", () => {
    const first = seedPlan(data, images);
    const listingId = stableId("listing:lampe");

    expect(first.objects.map((o) => o.file)).toEqual(["lampe/01.jpg", "lampe/02.jpg"]);
    expect(first.objects.every((o) => /^listings\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/.test(o.key))).toBe(true);
    expect(first.sql).toContain(`'${listingId}', '${first.objects[0].key}', 0);`);
    expect(first.sql).toContain(`'${listingId}', '${first.objects[1].key}', 1);`);
    expect(seedPlan(data, { lampe: ["01.jpg", "02.jpg"] }).objects).toEqual(first.objects);
  });

  it("tar høyst 10 bilder per annonse", () => {
    const many = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, "0")}.jpg`);
    expect(seedPlan(data, { lampe: many }).objects).toHaveLength(10);
  });
});

describe("removePlan", () => {
  it("sletter bare demodataene og de samme R2-nøklene som ble lagt inn", () => {
    const { sql, keys } = removePlan(data, images);

    expect(sql).not.toContain("INSERT");
    expect(sql.split("\n").every((line) => line.includes("IN ('demo-a', 'demo-it')"))).toBe(true);
    expect(keys).toEqual(seedPlan(data, images).objects.map((o) => o.key));
  });
});
