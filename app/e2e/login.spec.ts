// Nettlesertester for innloggingen, mot produksjonsbygget. Godkjent av Max 05.10.
// Hele kodeflyten testes i integrasjonstestene; innloggede sider testes i listings.spec.ts med en
// testøkt fra global-setup.ts (#94). Den lokale snarveien /dev/login (#106) finnes bare
// under utviklingsserveren; testen nederst beviser at den ikke finnes i produksjonsbygget.
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

// Godkjent av Max 08.10. Klikk fra kort til annonseside kommer med innlogget tilstand (#94).
test("annonsesiden uten innlogging sender til innloggingen", async ({ page }) => {
  await page.goto("/listings/seed-sale");
  await expect(page).toHaveURL(/\/login$/);
});

test("ukjente adresser gir HTTP 404", async ({ request }) => {
  const response = await request.get("/finnes-ikke");
  expect(response.status()).toBe(404);
});

test("/dev/login finnes ikke i produksjonsbygget", async ({ page }) => {
  const response = await page.goto("/dev/login");

  expect(response?.status()).toBe(404);
  expect(await page.context().cookies()).toEqual([]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
