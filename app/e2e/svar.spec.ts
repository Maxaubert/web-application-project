// Selgeren svarer på bud (#187). Mockup godkjent av Max 18.10. Selgeren «E2E Selger» er innlogget, og tre bud fra
// «E2E Kjøper» ligger klare (global-setup legger dem inn på nytt før hver kjøring).
import { expect, test, type Page } from "@playwright/test";
import { BUYER_AUTH_FILE, SELLER_AUTH_FILE } from "./global-setup";

test.use({ storageState: SELLER_AUTH_FILE });

// Banneret er et <p role="status">, meldingen etter svaret (#203) en <div role="status">.
const bannerOf = (page: Page) => page.locator('p[role="status"]');
const toastOf = (page: Page) => page.locator('div[role="status"]');

test("selgeren godtar et bud fra Min side", async ({ page }) => {
  await page.goto("/me", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Svartest godta" }).click();
  await expect(page).toHaveURL(/\/requests\/e2e-req-godta$/);
  await expect(page.getByText("Nytt bud fra E2E Kjøper")).toBeVisible();
  await expect(page.getByRole("button", { name: "Godta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Motbud" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Avslå" })).toBeVisible();

  await page.getByRole("button", { name: "Godta" }).click();

  await expect(toastOf(page)).toHaveText(/Du godtok budet/);
  await expect(page).toHaveURL(/\/requests\/e2e-req-godta$/);
  await expect(bannerOf(page)).toHaveText("Avtalt");
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);
  await expect(page.getByText("220 kr", { exact: true })).toBeVisible();
});

test("selgeren sender et motbud, og feil pris viser en feil først", async ({ page }) => {
  await page.goto("/requests/e2e-req-motbud", { waitUntil: "networkidle" });
  await expect(page.getByLabel("Ditt motbud (kr)")).toHaveCount(0);

  await page.getByRole("button", { name: "Motbud" }).click();
  await page.getByLabel("Ditt motbud (kr)").fill("0");
  await page.getByRole("button", { name: "Send motbud" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bud må være minst 1 kr" })).toBeVisible();
  await expect(page.getByLabel("Ditt motbud (kr)")).toHaveValue("0");

  await page.getByLabel("Ditt motbud (kr)").fill("240");
  await page.getByRole("button", { name: "Send motbud" }).click();

  await expect(toastOf(page)).toHaveText(/Motbud sendt: 240 kr/);
  await expect(page).toHaveURL(/\/requests\/e2e-req-motbud$/);
  await expect(bannerOf(page)).toHaveText("Venter på svar fra E2E Kjøper");
  await expect(page.getByText("Ditt motbud")).toBeVisible();
  await expect(page.getByText("240 kr", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);

  // Meldingen står i noen sekunder og forsvinner av seg selv.
  await expect(toastOf(page)).toBeHidden({ timeout: 9_000 });
});

test("selgeren avslår først etter en bekreftelse, og Avbryt angrer", async ({ page }) => {
  await page.goto("/requests/e2e-req-avslag", { waitUntil: "networkidle" });
  await expect(page.getByText("Avslå forespørselen?")).toHaveCount(0);

  await page.getByRole("button", { name: "Avslå" }).click();
  await expect(page.getByText("Avslå forespørselen?")).toBeVisible();
  await page.getByRole("button", { name: "Avbryt" }).click();
  await expect(page.getByText("Avslå forespørselen?")).toHaveCount(0);
  await expect(bannerOf(page)).toHaveText("Nytt bud fra E2E Kjøper");

  await page.getByRole("button", { name: "Avslå" }).click();
  await page.getByRole("button", { name: "Ja, avslå" }).click();

  await expect(toastOf(page)).toHaveText(/Forespørselen er avslått/);
  await expect(bannerOf(page)).toHaveText("Avslått");
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);
});

// Lån og gis bort (#208). «E2E Kjøper» ber om å låne 12.11 – 19.11 og om å få lampen.
test("selgeren sender motbud på et lån med ny periode, og låneren godtar det", async ({ page, browser, baseURL }) => {
  await page.goto("/requests/e2e-req-lan", { waitUntil: "networkidle" });
  await expect(bannerOf(page)).toHaveText("Ny forespørsel fra E2E Kjøper");
  await expect(page.getByLabel("Fra")).toHaveCount(0);

  await page.getByRole("button", { name: "Motbud" }).click();
  await page.getByLabel("Fra").fill("2026-11-14");
  await page.getByLabel("Til").fill("2026-11-17");
  await page.getByRole("button", { name: "Send motbud" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Lånet må vare minst én uke" })).toBeVisible();
  await expect(page.getByLabel("Fra")).toHaveValue("2026-11-14");

  await page.getByLabel("Til").fill("2026-11-21");
  await expect(page.getByText("Antall dager")).toBeVisible();
  await page.getByRole("button", { name: "Send motbud" }).click();

  await expect(toastOf(page)).toHaveText(/Motbud sendt: 14\.11 – 21\.11/);
  await expect(bannerOf(page)).toHaveText("Venter på svar fra E2E Kjøper");
  await expect(page.getByText("14.11 – 21.11", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);

  const buyer = await browser.newContext({ storageState: BUYER_AUTH_FILE, baseURL });
  const buyerPage = await buyer.newPage();
  await buyerPage.goto("/requests/e2e-req-lan", { waitUntil: "networkidle" });
  await expect(buyerPage.locator('p[role="status"]')).toHaveText("Motforslag fra E2E Selger");
  await buyerPage.getByRole("button", { name: "Godta" }).click();
  await expect(buyerPage.locator('div[role="status"]')).toHaveText(/Du godtok forespørselen/);
  await expect(buyerPage.locator('p[role="status"]')).toHaveText("Avtalt");
  await expect(buyerPage.getByText("14.11 – 21.11", { exact: true })).toBeVisible();
  await buyer.close();
});

test("en gis bort har bare Godta og Avslå, og Godta gir «Du godtok forespørselen»", async ({ page }) => {
  await page.goto("/requests/e2e-req-gis", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Godta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Avslå" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Motbud" })).toHaveCount(0);

  await page.getByRole("button", { name: "Godta" }).click();

  await expect(toastOf(page)).toHaveText(/Du godtok forespørselen/);
  await expect(bannerOf(page)).toHaveText("Avtalt");
});
