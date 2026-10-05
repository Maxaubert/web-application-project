// Nettlesertester for innloggingen, mot produksjonsbygget. Godkjent av Max 05.10.
// Hele kodeflyten testes i integrasjonstestene: en nettlesertest kan ikke lese koden
// fra serverloggen uten en bakdør i appen, og den bygger vi ikke.
import { expect, test } from "@playwright/test";

test("innloggingssiden vises med etikett, uten nettleserfeil og med sikkerhetsheader", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/login");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page.getByRole("heading", { name: "Logg inn" })).toBeVisible();
  await expect(page.getByLabel("HiØ-e-post")).toBeVisible();
  expect(errors).toEqual([]);
});

test("en adresse utenfor @hiof.no gir feilmelding", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("HiØ-e-post").fill("ola@gmail.com");
  await page.getByRole("button", { name: "Fortsett" }).click();

  await expect(page.getByText("Bruk HiØ-e-posten din (@hiof.no).")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("forsiden uten innlogging sender til innloggingen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("ukjente adresser gir HTTP 404", async ({ request }) => {
  const response = await request.get("/finnes-ikke");
  expect(response.status()).toBe(404);
});
