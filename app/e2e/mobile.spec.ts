// Mobilvisning (#147, #162). Godkjent av Max 11.10 (mockup). Produksjonsbygget i 375 px og i 1280 px.
import { expect, test } from "@playwright/test";
import { AUTH_FILE, TEST_LISTING_ID } from "./global-setup";

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

  test("søkefeltet og «Filtre» står på én rad, og Enter søker uten synlig knapp", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const field = page.getByRole("combobox", { name: "Søk i tittel, beskrivelse og selger" });
    const filters = page.getByRole("button", { name: "Filtre" });

    const [f, b] = [await field.boundingBox(), await filters.boundingBox()];
    expect(Math.abs(f!.y - b!.y)).toBeLessThan(2);
    expect(f!.x + f!.width).toBeLessThanOrEqual(b!.x);
    // Skjult for øyet, men i tilgjengelighetstreet: skjermleserbokser er 1 × 1 px.
    expect((await size(page.getByText("Søk i tittel, beskrivelse og selger"))).width).toBeLessThanOrEqual(1);
    expect((await size(page.getByRole("button", { name: "Søk" }))).width).toBeLessThanOrEqual(1);
    expect(await field.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("44px");
    await expect(field).toHaveAttribute("placeholder", "Søk");

    await field.fill("casio");
    await field.press("Enter");

    await expect(page).toHaveURL(/\?q=casio$/);
    await expect(page.getByText("Kalkulator Casio fx-991")).toBeVisible();
  });

  test("filterarket har ingen hjelpetekst om ukepris", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Filtre" }).click();

    await expect(page.getByRole("dialog", { name: "Filtre" })).toBeVisible();
    await expect(page.getByText("Ved lån gjelder prisen per uke.")).toHaveCount(0);
  });

  test("«Legg ut annonse» har liten tittel, og ikonene gjør at man fortsatt kommer dit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Legg ut annonse" }).click();

    await expect(page).toHaveURL(/\/listings\/new$/);
    expect(await fontSize(page.getByRole("heading", { name: "Legg ut annonse", level: 1 }))).toBe("24px");
  });

  test("annonsesiden har liten tittel, og miniatyrene ligger på én rad som kan rulles", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });

    expect(await fontSize(page.getByRole("heading", { level: 1 }))).toBe("24px");
    const back = await page.getByRole("link", { name: "Tilbake til annonser" }).boundingBox();
    const image = await page.getByRole("img").first().boundingBox();
    expect(image!.y - (back!.y + back!.height)).toBeLessThan(12);

    // Testannonsen har bare to bilder; ti miniatyrer lages ved å kopiere knappene, som i en annonse med flest bilder.
    const thumbs = page.getByRole("button", { name: /^Vis bilde/ });
    await thumbs.first().evaluate((el) => {
      for (let i = 0; i < 8; i++) el.parentElement!.appendChild(el.cloneNode(true));
    });
    const tops = await thumbs.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(tops).toHaveLength(10);
    expect(new Set(tops).size).toBe(1);
    const row = thumbs.first().locator("..");
    expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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

  test("søkefeltet har synlig etikett og «Søk»-knapp, og «Filtre» ligger i kolonnen til venstre", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Søk i tittel, beskrivelse og selger")).toBeVisible();
    await expect(page.getByRole("button", { name: "Søk" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Filtre" })).toBeHidden();
    const field = page.getByRole("combobox", { name: "Søk i tittel, beskrivelse og selger" });
    expect(await field.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("16px");
    expect(await field.evaluate((el) => getComputedStyle(el, "::placeholder").color)).toBe("rgba(0, 0, 0, 0)");
  });

  test("annonsesiden har stor tittel, og miniatyrene brytes over flere linjer", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });

    expect(await fontSize(page.getByRole("heading", { level: 1 }))).toBe("36px");
    const thumbs = page.getByRole("button", { name: /^Vis bilde/ });
    await thumbs.first().evaluate((el) => {
      for (let i = 0; i < 8; i++) el.parentElement!.appendChild(el.cloneNode(true));
    });
    const tops = await thumbs.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBeGreaterThan(1);
  });
});
