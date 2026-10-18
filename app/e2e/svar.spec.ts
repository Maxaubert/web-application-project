// Selgeren svarer på bud (#187). Mockup godkjent av Max 18.10. Selgeren «E2E Selger» er innlogget, og tre bud fra
// «E2E Kjøper» ligger klare (global-setup legger dem inn på nytt før hver kjøring).
import { expect, test } from "@playwright/test";
import { SELLER_AUTH_FILE } from "./global-setup";

test.use({ storageState: SELLER_AUTH_FILE });

test("selgeren godtar et bud fra Min side", async ({ page }) => {
  await page.goto("/me", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Svartest godta" }).click();
  await expect(page).toHaveURL(/\/requests\/e2e-req-godta$/);
  await expect(page.getByText("Nytt bud fra E2E Kjøper")).toBeVisible();
  await expect(page.getByRole("button", { name: "Godta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Motbud" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Avslå" })).toBeVisible();

  await page.getByRole("button", { name: "Godta" }).click();

  await expect(page.getByRole("status")).toHaveText("Avtalt");
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);
  await expect(page.getByText("E2E Kjøper bød 220 kr")).toBeVisible();
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

  await expect(page.getByRole("status")).toHaveText("Venter på svar fra E2E Kjøper");
  await expect(page.getByText("Du foreslo 240 kr")).toBeVisible();
  await expect(page.getByText("E2E Kjøper bød 200 kr")).toBeVisible();
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);
});

test("selgeren avslår først etter en bekreftelse, og Avbryt angrer", async ({ page }) => {
  await page.goto("/requests/e2e-req-avslag", { waitUntil: "networkidle" });
  await expect(page.getByText("Avslå forespørselen?")).toHaveCount(0);

  await page.getByRole("button", { name: "Avslå" }).click();
  await expect(page.getByText("Avslå forespørselen?")).toBeVisible();
  await page.getByRole("button", { name: "Avbryt" }).click();
  await expect(page.getByText("Avslå forespørselen?")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Nytt bud fra E2E Kjøper");

  await page.getByRole("button", { name: "Avslå" }).click();
  await page.getByRole("button", { name: "Ja, avslå" }).click();

  await expect(page.getByRole("status")).toHaveText("Avslått");
  await expect(page.getByRole("button", { name: "Godta" })).toHaveCount(0);
});
