// Mine annonser (#229). «E2E Testesen» eier «Kalkulator Casio fx-991» (global-setup). Godkjent av Max 24.10.
import { expect, test, type Page } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const rowOf = (page: Page) => page.getByRole("listitem").filter({ hasText: "Kalkulator Casio fx-991" });

test("«Administrer» i raden åpner redigeringssiden, og klikk på raden åpner annonsen", async ({ page }) => {
  await page.goto("/me?tab=listings", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Mine annonser" })).toHaveAttribute("aria-current", "page");

  await rowOf(page).getByRole("link", { name: "Administrer" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Administrer annonse" })).toBeVisible();
  await expect(page).toHaveURL(/\/listings\/e2e-calc\/edit$/);

  await page.goto("/me?tab=listings", { waitUntil: "networkidle" });
  await rowOf(page).getByRole("link", { name: "Kalkulator Casio fx-991" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Kalkulator Casio fx-991" })).toBeVisible();
  await expect(page).toHaveURL(/\/listings\/e2e-calc$/);
});
