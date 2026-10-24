// Hjertet (#224). «E2E Testesen» lagrer «Favoritt sykkel» fra «E2E Selger» (global-setup legger annonsen inn og
// tømmer favorittene før hver kjøring). Godkjent av Max 24.10. Fanen Mine favoritter kommer i neste PR.
import { expect, test, type Page } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const cardHeart = (page: Page) => page.getByRole("article").filter({ hasText: "Favoritt sykkel" }).getByRole("button");

test("hjertet på kortet lagres, er fylt på annonsesiden, og kan fjernes der", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(cardHeart(page)).toHaveAttribute("aria-pressed", "false");

  await cardHeart(page).click();
  await expect(cardHeart(page)).toHaveAttribute("aria-pressed", "true");
  await expect(cardHeart(page)).toHaveAccessibleName("Fjern fra favoritter");

  await page.reload({ waitUntil: "networkidle" });
  await expect(cardHeart(page)).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: /Favoritt sykkel/ }).click();
  await expect(page).toHaveURL(/\/listings\/e2e-fav$/);
  // Adressen skifter før den nye siden er tegnet (klientnavigasjon), så vi venter på overskriften.
  await expect(page.getByRole("heading", { level: 1, name: "Favoritt sykkel" })).toBeVisible();
  const pageHeart = page.getByRole("button", { name: "Fjern fra favoritter" });
  await expect(pageHeart).toHaveAttribute("aria-pressed", "true");

  await pageHeart.click();
  await expect(page.getByRole("button", { name: "Lagre som favoritt" })).toHaveAttribute("aria-pressed", "false");

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(cardHeart(page)).toHaveAttribute("aria-pressed", "false");
});

// Fanen Mine favoritter (#224). Godkjent av Max 24.10.
test("en lagret annonse står i Mine favoritter og forsvinner når hjertet tas av der", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await cardHeart(page).click();
  await expect(cardHeart(page)).toHaveAttribute("aria-pressed", "true");

  await page.goto("/me?tab=favorites", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Mine favoritter" })).toHaveAttribute("aria-current", "page");
  const row = page.getByRole("listitem").filter({ hasText: "Favoritt sykkel" });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "Fjern fra favoritter" }).click();
  await expect(row).toHaveCount(0);
  await expect(page.getByText("Du har ingen favoritter")).toBeVisible();
});
