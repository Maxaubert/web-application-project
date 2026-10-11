// «Legg ut annonse» på mobil (#147, #169). Forhåndsvisningen er skjult under 640 px, så «Tittel» ligger høyt opp.
// Produksjonsbygget i 375 px og i 1280 px.
import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

test.describe("mobil (375 px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("ingen forhåndsvisning, og «Tittel» ligger høyt opp", async ({ page }) => {
    await page.goto("/listings/new");

    await expect(page.getByRole("button", { name: "Legg til bilder" })).toBeHidden();
    const add = page.getByRole("button", { name: "Legg til", exact: true });
    await expect(add).toBeVisible();
    expect((await page.getByLabel("Tittel").boundingBox())!.y).toBeLessThan(330);
  });

  test("manglende bilde gir feil som peker på «Legg til», og bilder vises i raden", async ({ page }) => {
    await page.goto("/listings/new", { waitUntil: "networkidle" });
    const add = page.getByRole("button", { name: "Legg til", exact: true });

    await page.getByRole("button", { name: "Publiser annonse" }).click();
    await expect(page.locator("#images-error")).toHaveText("Legg til minst ett bilde");
    await page.getByRole("link", { name: "Legg til minst ett bilde" }).click();
    await expect(add).toBeFocused();
    await expect(add).toHaveAttribute("aria-describedby", "images-error");
    expect(await add.evaluate((el) => getComputedStyle(el).borderColor)).not.toBe("rgb(29, 27, 24)");

    await page.getByLabel("Bilder").setInputFiles("e2e/fixtures/test.jpg");
    await expect(page.getByRole("button", { name: "Bilde 1", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});

test.describe("desktop (1280 px)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("forhåndsvisningen med «Legg til bilder» vises", async ({ page }) => {
    await page.goto("/listings/new");

    await expect(page.getByRole("button", { name: "Legg til bilder" })).toBeVisible();
  });
});
