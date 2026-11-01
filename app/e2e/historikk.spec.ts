// Historikk (#220). «E2E Kjøper» har en avslått forespørsel på «Historikktest bok» (global-setup). Godkjent av Max 01.11.
import { expect, test } from "@playwright/test";
import { BUYER_AUTH_FILE } from "./global-setup";

test.use({ storageState: BUYER_AUTH_FILE });

test("en avslått forespørsel står i Historikk og ikke under Sendt", async ({ page }) => {
  await page.goto("/me?show=sent", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "Min side" })).toBeVisible();
  await expect(page.getByText("Historikktest bok")).toHaveCount(0);

  await page.goto("/me?tab=history", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Historikk", exact: true })).toHaveAttribute("aria-current", "page");
  const row = page.getByRole("listitem").filter({ hasText: "Historikktest bok" });
  await expect(row).toContainText("Avslått");
});
