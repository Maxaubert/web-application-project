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
