// «Administrer» (#229). «E2E Testesen» endrer og sletter «Rediger stol» (global-setup legger den inn på nytt, aktiv og
// med opprinnelig tittel, før hver kjøring). Godkjent av Max 24.10.
import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

test("eieren endrer tittel og pris fra annonsesiden, og sletter annonsen etter en bekreftelse", async ({ page }) => {
  await page.goto("/listings/e2e-rediger", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Administrer" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Administrer annonse" })).toBeVisible();

  await page.getByLabel("Tittel").fill("Redigert stol");
  await page.getByLabel("Pris (kr)").fill("175");
  await page.getByRole("button", { name: "Lagre endringer" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Redigert stol" })).toBeVisible();
  await expect(page).toHaveURL(/\/listings\/e2e-rediger$/);
  await expect(page.getByText("175 kr", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Administrer" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Administrer annonse" })).toBeVisible();
  await page.getByRole("button", { name: "Slett annonse" }).click();
  await expect(page.getByText("Slette annonsen?")).toBeVisible();
  await page.getByRole("button", { name: "Avbryt" }).click();
  await expect(page.getByText("Slette annonsen?")).toHaveCount(0);

  await page.getByRole("button", { name: "Slett annonse" }).click();
  await page.getByRole("button", { name: "Ja, slett" }).click();
  await expect(page).toHaveURL(/\/me\?tab=listings$/);

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByText("Redigert stol")).toHaveCount(0);
});
