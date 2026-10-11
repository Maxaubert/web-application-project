// Mobilvisning (#147, #162). Godkjent av Max 11.10 (mockup). Produksjonsbygget i 375 px og i 1280 px.
import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const size = (locator: import("@playwright/test").Locator) => locator.boundingBox().then((b) => ({ width: Math.round(b!.width), height: Math.round(b!.height) }));
const fontSize = (locator: import("@playwright/test").Locator) => locator.evaluate((el) => getComputedStyle(el).fontSize);

test.describe("mobil (375 px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("toppknappene er ikonknapper på 44 px, og tittelen er mindre", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Legg ut annonse" })).toBeVisible();
    expect(await size(page.getByRole("link", { name: "Legg ut annonse" }))).toEqual({ width: 44, height: 44 });
    expect(await size(page.getByRole("button", { name: "Logg ut" }))).toEqual({ width: 44, height: 44 });
    expect(await fontSize(page.getByRole("heading", { name: "Annonser", level: 1 }))).toBe("24px");
    // Ingen sidelengs rulling.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("«Legg ut annonse» har liten tittel, og ikonene gjør at man fortsatt kommer dit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Legg ut annonse" }).click();

    await expect(page).toHaveURL(/\/listings\/new$/);
    expect(await fontSize(page.getByRole("heading", { name: "Legg ut annonse", level: 1 }))).toBe("24px");
  });
});

test.describe("desktop (1280 px)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("toppknappene har tekst og tittelen er stor", async ({ page }) => {
    await page.goto("/");

    expect((await size(page.getByRole("link", { name: "Legg ut annonse" }))).width).toBeGreaterThan(100);
    expect((await size(page.getByRole("button", { name: "Logg ut" }))).width).toBeGreaterThan(70);
    expect(await fontSize(page.getByRole("heading", { name: "Annonser", level: 1 }))).toBe("36px");
  });
});
