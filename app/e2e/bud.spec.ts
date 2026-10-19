// Bud på en salgsannonse (#185). Mockup godkjent av Max 17.10. Produksjonsbygget; testbrukeren byr på annonser
// som selgeren «E2E Selger» eier, og har ingen bud fra før (global-setup rydder dem).
import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

test("legge inn et bud og endre det", async ({ page }) => {
  await page.goto("/listings/e2e-bid", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Legg inn bud" }).click();

  await expect(page).toHaveURL(/\/listings\/e2e-bid\/bid$/);
  await expect(page.getByRole("heading", { name: "Legg inn bud" })).toBeVisible();
  await expect(page.getByText("Selger: E2E Selger")).toBeVisible();
  await page.getByLabel("Ditt bud (kr)").fill("220");
  await page.getByRole("button", { name: "Send bud" }).click();

  await expect(page).toHaveURL(/\/listings\/e2e-bid$/);
  await expect(page.getByText("Ditt bud: 220 kr")).toBeVisible();
  await expect(page.getByRole("link", { name: "Legg inn bud" })).toHaveCount(0);

  await page.getByRole("link", { name: "Endre bud" }).click();
  await expect(page.getByRole("heading", { name: "Endre bud" })).toBeVisible();
  await expect(page.getByLabel("Ditt bud (kr)")).toHaveValue("220");
  await page.getByLabel("Ditt bud (kr)").fill("230");
  await page.getByRole("button", { name: "Send bud" }).click();

  await expect(page.getByText("Ditt bud: 230 kr")).toBeVisible();

  // Budet er en lenke til forespørselssiden (#192): status og siste bud. Historikk-panelet er fjernet (#205).
  await page.getByRole("link", { name: "Ditt bud: 230 kr" }).click();
  await expect(page).toHaveURL(/\/requests\/[\w-]+$/);
  await expect(page.getByText("Venter på svar fra E2E Selger")).toBeVisible();
  await expect(page.getByText("Ditt bud")).toBeVisible();
  await expect(page.getByText("230 kr", { exact: true })).toBeVisible();
  await expect(page.getByText("Historikk")).toHaveCount(0);
  // Annonsekortet øverst går til annonsen (#193).
  await page.getByRole("main").getByRole("link", { name: "Budtest" }).click();
  await expect(page).toHaveURL(/\/listings\/e2e-bid$/);
});

// Min side (#193): kjøperen finner forespørselen under Sendt og kommer tilbake til den. Mockup godkjent av Max 17.10.
// Bygger på budet fra testen over (samme fil kjører i rekkefølge, og global-setup rydder budene før hver kjøring).
test("Min side viser forespørselen under Sendt og åpner den", async ({ page }) => {
  await page.goto("/listings/e2e-bid", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Ditt bud: 230 kr" }).click();
  await expect(page).toHaveURL(/\/requests\/[\w-]+$/);

  await page.getByRole("banner").getByRole("link", { name: "Min side" }).click();
  await expect(page).toHaveURL(/\/me$/);
  await expect(page.getByRole("heading", { name: "Min side", level: 1 })).toBeVisible();
  await expect(page.getByText("E2E Testesen")).toBeVisible();
  await expect(page.getByText("Du har ikke mottatt noen forespørsler")).toBeVisible();

  await page.getByRole("link", { name: "Sendt (1)" }).click();
  await expect(page).toHaveURL(/\/me\?show=sent$/);
  await expect(page.getByText("Selgers tur")).toBeVisible();
  await expect(page.getByText("Til E2E Selger · 230 kr")).toBeVisible();

  await page.getByRole("link", { name: "Budtest" }).click();
  await expect(page).toHaveURL(/\/requests\/[\w-]+$/);
  await page.getByRole("main").getByRole("link", { name: "Min side" }).click();
  await expect(page).toHaveURL(/\/me\?show=sent$/);
});

test("et ugyldig bud viser feilen under feltet og lagrer ikke noe", async ({ page }) => {
  await page.goto("/listings/e2e-bid-error/bid", { waitUntil: "networkidle" });
  await page.getByLabel("Ditt bud (kr)").fill("0");
  await page.getByRole("button", { name: "Send bud" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "Bud må være minst 1 kr" })).toBeVisible();
  await expect(page).toHaveURL(/\/listings\/e2e-bid-error\/bid$/);
  await expect(page.getByLabel("Ditt bud (kr)")).toHaveValue("0");

  await page.goto("/listings/e2e-bid-error", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Legg inn bud" })).toBeVisible();
});

test("på din egen annonse er knappen grået ut, og budsiden sender deg tilbake", async ({ page }) => {
  await page.goto("/listings/e2e-calc", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Legg inn bud" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Legg inn bud" })).toHaveCount(0);

  await page.goto("/listings/e2e-calc/bid");
  await expect(page).toHaveURL(/\/listings\/e2e-calc$/);
});
