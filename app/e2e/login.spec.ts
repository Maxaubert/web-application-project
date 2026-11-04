// Nettlesertester for innloggingen, mot produksjonsbygget. Godkjent av Max 05.10.
// Hele kodeflyten testes i integrasjonstestene; innloggede sider testes i listings.spec.ts med en
// testøkt fra global-setup.ts (#94).
import { expect, test } from "@playwright/test";
import { TEST_IMAGE_PATH } from "./global-setup";

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

// #57: JavaScript holdes igjen, som på en treg mobil. Knappen er låst til React har lastet, og da kommer feilmeldingen
// frem. Før rettingen kunne et tidlig klikk sende skjemaet uten handlingen. Godkjent av Max 02.11.
test("en adresse utenfor @hiof.no gir feilmelding, også når siden laster tregt", async ({ page }) => {
  let releaseScripts = () => {};
  const scriptsHeld = new Promise<void>((resolve) => (releaseScripts = resolve));
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") await scriptsHeld;
    await route.continue();
  });
  await page.goto("/login", { waitUntil: "commit" });
  await page.getByLabel("HiØ-e-post").fill("ola@gmail.com");
  await expect(page.getByRole("button", { name: "Fortsett" })).toBeDisabled();

  releaseScripts();
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

// Min side (#193) viser kontaktinfo, så uten innlogging skal den aldri tegnes, ikke engang tom.
test("Min side uten innlogging sender til innloggingen", async ({ page }) => {
  await page.goto("/me");
  await expect(page).toHaveURL(/\/login$/);
});

test("ukjente adresser gir HTTP 404", async ({ request }) => {
  const response = await request.get("/finnes-ikke");
  expect(response.status()).toBe(404);
});

// Bilder bare for innloggede (#138). Godkjent av Max 11.10.
test("annonsebilder gir 401 uten innlogging", async ({ request }) => {
  const response = await request.get(TEST_IMAGE_PATH);

  expect(response.status()).toBe(401);
});
