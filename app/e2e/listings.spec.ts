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

// Live søkeforslag (#104). Godkjent av Max 10.10.
test.describe("søkeforslag", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  const field = (page: import("@playwright/test").Page) => page.getByRole("combobox", { name: "Søk i tittel, beskrivelse og selger" });

  test("forslag vises mens man skriver, uten å trykke Enter", async ({ page }) => {
    await field(page).pressSequentially("casi");

    const list = page.getByRole("listbox", { name: "Søkeforslag" });
    await expect(list.getByRole("option", { name: /Kalkulator Casio fx-991/ })).toBeVisible();
    await expect(list.getByRole("option", { name: "Vis alle treff for «casi»" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("piltast og Enter åpner annonsen", async ({ page }) => {
    await field(page).pressSequentially("casi");
    await expect(page.getByRole("option", { name: /Kalkulator Casio fx-991/ })).toBeVisible();

    await field(page).press("ArrowDown");
    await field(page).press("Enter");

    await expect(page).toHaveURL(/\/listings\/e2e-calc$/);
  });

  test("klikk på Vis alle gir resultatsiden", async ({ page }) => {
    await field(page).pressSequentially("casi");

    await page.getByRole("option", { name: "Vis alle treff for «casi»" }).click();

    await expect(page).toHaveURL(/\/\?q=casi$/);
  });

  test("Escape lukker forslagene, og ett tegn viser ingenting", async ({ page }) => {
    await field(page).pressSequentially("casi");
    await expect(page.getByRole("listbox")).toBeVisible();

    await field(page).press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();

    await field(page).fill("c");
    await page.waitForTimeout(500);
    await expect(page.getByRole("listbox")).toBeHidden();
  });

  test("ingen treff viser ingen boks", async ({ page }) => {
    await field(page).pressSequentially("xyzxyz");
    await page.waitForTimeout(500);

    await expect(page.getByRole("listbox")).toBeHidden();
  });
});

// Finpuss (#113). Godkjent av Max 10.10.
test("knapper viser pekehånd, og søkefeltet får mørk kant i stedet for blå ramme", async ({ page }) => {
  await page.goto("/");
  const cursor = (name: string) => page.getByRole("button", { name }).evaluate((el) => getComputedStyle(el).cursor);
  expect(await cursor("Logg ut")).toBe("pointer");
  expect(await cursor("Søk")).toBe("pointer");

  const field = page.getByRole("combobox");
  await field.click();
  const style = await field.evaluate((el) => ({ outline: getComputedStyle(el).outlineStyle, border: getComputedStyle(el).borderColor }));
  expect(style.outline).toBe("none");
  expect(style.border).toBe("rgb(29, 27, 24)");
});
