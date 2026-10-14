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

    await page.getByRole("button", { name: "Publiser", exact: true }).click();
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

// Forhåndsvis (#171): selve annonsesiden med det som er skrevet, i en dialog. Samme oppførsel på mobil og desktop.
const preview = (viewport: { width: number; height: number }) => {
  test.use({ viewport });

  test("«Forhåndsvis» viser annonsesiden med selgeren og bildet, og Avbryt og Esc beholder det som er skrevet", async ({ page }) => {
    await page.goto("/listings/new", { waitUntil: "networkidle" });
    await page.getByLabel("Tittel").fill("Skrivebordslampe");
    await page.getByLabel("Beskrivelse").fill("Lite brukt.");
    await page.getByLabel("Kategori").selectOption({ label: "Møbler" });
    await page.getByLabel("Pris (kr)").fill("120");
    await page.getByRole("radio", { name: "Brukt" }).check();
    await page.getByLabel("Bilder").setInputFiles(["e2e/fixtures/test.jpg", "e2e/fixtures/test.jpg"]);
    await expect(page.getByRole("button", { name: "Bilde 2", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Forhåndsvis" }).click();

    const dialog = page.getByRole("dialog", { name: "Forhåndsvisning" });
    await expect(dialog).toBeVisible();
    // Begge bildene står i miniatyrraden, som i den ekte annonsesiden.
    await expect(dialog.getByRole("button", { name: "Vis bilde 2 av 2" })).toHaveAttribute("style", /url\("?blob:/);
    await expect(dialog.getByRole("heading", { name: "Skrivebordslampe", level: 1 })).toBeVisible();
    for (const text of ["120 kr", "Møbler", "Brukt", "Lite brukt.", "E2E Testesen"]) await expect(dialog.getByText(text, { exact: true })).toBeVisible();
    await expect(dialog.getByRole("img")).toBeVisible();
    await expect(dialog.getByRole("link")).toHaveCount(0);
    expect(await dialog.evaluate((el) => el.getBoundingClientRect().width)).toBe(page.viewportSize()!.width);

    await dialog.getByRole("button", { name: "Avbryt" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel("Tittel")).toHaveValue("Skrivebordslampe");

    await page.getByRole("button", { name: "Forhåndsvis" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel("Pris (kr)")).toHaveValue("120");
    await expect(page).toHaveURL(/\/listings\/new$/);
  });

  test("«Publiser» i forhåndsvisningen publiserer annonsen", async ({ page }) => {
    const title = `E2E-forhåndsvis ${Date.now()}`;
    await page.goto("/listings/new", { waitUntil: "networkidle" });
    await page.getByLabel("Tittel").fill(title);
    await page.getByLabel("Beskrivelse").fill("Lite brukt.");
    await page.getByLabel("Kategori").selectOption({ label: "Møbler" });
    await page.getByLabel("Pris (kr)").fill("120");
    await page.getByRole("radio", { name: "Brukt" }).check();
    await page.getByLabel("Bilder").setInputFiles("e2e/fixtures/test.jpg");
    await expect(page.getByRole("button", { name: "Publiser", exact: true })).toBeEnabled();

    await page.getByRole("button", { name: "Forhåndsvis" }).click();
    await page.getByRole("dialog", { name: "Forhåndsvisning" }).getByRole("button", { name: "Publiser", exact: true }).click();

    await expect(page).toHaveURL(/\/listings\/[^/]+\?publisert=1$/);
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  });

  test("«Publiser» i forhåndsvisningen med feil lukker den og viser feilene i skjemaet", async ({ page }) => {
    await page.goto("/listings/new", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Forhåndsvis" }).click();
    const dialog = page.getByRole("dialog", { name: "Forhåndsvisning" });

    await dialog.getByRole("button", { name: "Publiser", exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { name: /^Rett \d+ feil før du publiserer$/ })).toBeVisible();
    await expect(page.locator("#images-error")).toHaveText("Legg til minst ett bilde");
  });

  test("uten noe skrevet viser «Forhåndsvis» plassholderen «Tittel» og ikke noe krasj", async ({ page }) => {
    await page.goto("/listings/new", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Forhåndsvis" }).click();

    const dialog = page.getByRole("dialog", { name: "Forhåndsvisning" });
    await expect(dialog.getByRole("heading", { name: "Tittel", level: 1 })).toBeVisible();
  });
};

test.describe("forhåndsvisning, mobil (375 px)", () => preview({ width: 375, height: 812 }));
test.describe("forhåndsvisning, desktop (1280 px)", () => preview({ width: 1280, height: 800 }));

test.describe("desktop (1280 px)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("forhåndsvisningen med «Legg til bilder» vises", async ({ page }) => {
    await page.goto("/listings/new");

    await expect(page.getByRole("button", { name: "Legg til bilder" })).toBeVisible();
  });
});
