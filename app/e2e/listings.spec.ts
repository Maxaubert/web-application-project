// Nettlesertester som innlogget bruker (#94), mot produksjonsbygget. Økten og testannonsene legges inn
// av global-setup.ts. Godkjent av Max 10.10.
import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

test("innlogget bruker ser annonsene og kan åpne en annonse fra kortet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Annonser", level: 1 })).toBeVisible();

  await page.getByText("Kalkulator Casio fx-991").click();

  await expect(page).toHaveURL(/\/listings\/e2e-calc$/);
  await expect(page.getByRole("heading", { name: "Kalkulator Casio fx-991", level: 1 })).toBeVisible();
});

test("søkeskjemaet viser treffene og beholder søkeordet", async ({ page }) => {
  await page.goto("/");
  const field = page.getByLabel("Søk i tittel, beskrivelse og selger");

  await field.fill("casio");
  await page.getByRole("button", { name: "Søk" }).click();

  await expect(page).toHaveURL(/\?q=casio$/);
  await expect(page.getByText("Kalkulator Casio fx-991")).toBeVisible();
  await expect(page.getByText("Hengekøye")).toHaveCount(0);
  await expect(field).toHaveValue("casio");
});
