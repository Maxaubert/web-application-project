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
  // Vent til skriptene er lastet og React har tatt over feltet; ellers kan testen skrive før forslagene virker
  // (sett én gang i CI etter at filtrene ga mer klientkode, #120).
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
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
  // Selve avkrysningsboksen og nedtrekkslisten, ikke bare etiketten (#128).
  const cursorOf = (el: Element) => getComputedStyle(el).cursor;
  expect(await page.getByLabel("Lån").evaluate(cursorOf)).toBe("pointer");
  expect(await page.getByLabel("Kategori").evaluate(cursorOf)).toBe("pointer");

  const field = page.getByRole("combobox", { name: "Søk i tittel, beskrivelse og selger" });
  await field.click();
  const style = await field.evaluate((el) => ({ outline: getComputedStyle(el).outlineStyle, border: getComputedStyle(el).borderColor }));
  expect(style.outline).toBe("none");
  expect(style.border).toBe("rgb(29, 27, 24)");
});

// Filtre (#102, #122). Godkjent av Max 10.10. Antallet avhenger av hva som ligger i den lokale databasen,
// så testene sjekker hvilke testannonser som vises, ikke et bestemt tall.
test.describe("filtre", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("desktop: avkrysning virker med én gang, fokus blir stående, og Nullstill fjerner valget", async ({ page }) => {
    await page.getByLabel("Lån").check();

    await expect(page).toHaveURL(/\/\?type=loan$/);
    await expect(page.getByText("Hengekøye")).toBeVisible();
    await expect(page.getByText("Kalkulator Casio fx-991")).toHaveCount(0);
    await expect(page.getByLabel("Lån")).toBeFocused();

    await page.getByRole("link", { name: "Nullstill filtre" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel("Lån")).not.toBeChecked();
    await expect(page.getByText("Kalkulator Casio fx-991")).toBeVisible();
  });

  test("desktop: pris gjelder når man forlater feltet", async ({ page }) => {
    await page.getByLabel("Til kr").fill("100");
    await expect(page).toHaveURL(/\/$/);

    await page.getByLabel("Til kr").press("Tab");

    await expect(page).toHaveURL(/maxPrice=100/);
    await expect(page.getByText("Hengekøye")).toBeVisible();
    await expect(page.getByText("Kalkulator Casio fx-991")).toHaveCount(0);
  });

  test("mobil: arket oppdaterer annonsene bak seg, og «Vis»-knappen lukker det", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByLabel("Kategori")).toBeHidden();

    await page.getByRole("button", { name: "Filtre" }).click();
    const sheet = page.getByRole("dialog", { name: "Filtre" });
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("button", { name: "Filtre" })).toBeFocused();

    await page.getByRole("button", { name: "Filtre" }).click();
    await sheet.getByLabel("Kategori").selectOption({ label: "Elektronikk" });

    await expect(page).toHaveURL(/category=electronics/);
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: /^Vis \d+ annonser?$/ }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByText("Kalkulator Casio fx-991")).toBeVisible();
    await expect(page.getByText("Hengekøye")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Filtre 1 aktive" })).toBeVisible();
  });
});

// Justering på desktop (#126). Godkjent av Max 10.10. Grunnlinjen måles med et tomt element på tekstlinjen.
test("desktop: «Filtre» står på linje med «Annonser», og «Kategori» med søkefeltets etikett", async ({ page }) => {
  await page.goto("/");
  const baseline = (selector: string) =>
    page.locator(selector).evaluate((el) => {
      const marker = document.createElement("span");
      marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      el.appendChild(marker);
      const y = marker.getBoundingClientRect().top;
      marker.remove();
      return Math.round(y);
    });

  expect(await baseline("#filters-heading")).toBe(await baseline("h1"));
  expect(await baseline("label[for=filter-category]")).toBe(await baseline("label[for=q]"));
});

// Legg ut annonse (FK-03, #133). Godkjent av Max 11.10. Hver kjøring lager en ny annonse i den lokale
// databasen, så tittelen er unik.
test.describe("legg ut annonse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Legg ut annonse" }).click();
    await expect(page).toHaveURL(/\/listings\/new$/);
    await page.waitForLoadState("networkidle");
  });

  test("publiserer et lån og havner på annonsen med bekreftelse, og annonsen finnes i søket", async ({ page }) => {
    const title = `E2E-skjerm ${Date.now()}`;
    await page.getByLabel("Tittel").fill(title);
    await page.getByLabel("Beskrivelse").fill("HDMI-kabel følger med.");
    await page.getByLabel("Kategori").selectOption({ label: "Elektronikk" });
    await page.getByRole("radio", { name: "Lån" }).check();
    await page.getByLabel("Pris per uke (kr, valgfri)").fill("100");
    await page.getByRole("radio", { name: "Brukt" }).check();
    await expect(page.getByText("100 kr/uke")).toBeVisible();

    await page.getByRole("button", { name: "Publiser annonse" }).click();

    await expect(page).toHaveURL(/\/listings\/[^/]+\?publisert=1$/);
    await expect(page.getByRole("status")).toHaveText("Annonsen er publisert og synlig i søket.");
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();

    await page.goto(`/?q=${encodeURIComponent(title)}`);
    await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();
  });

  test("feil viser feilboksen med fokus, og valgene står igjen", async ({ page }) => {
    await page.getByLabel("Tittel").fill("ab");
    await page.getByRole("radio", { name: "Lån" }).check();
    await page.getByLabel("Pris per uke (kr, valgfri)").fill("100,-");

    await page.getByRole("button", { name: "Publiser annonse" }).click();

    await expect(page.getByRole("heading", { name: "Rett 5 feil før du publiserer" })).toBeVisible();
    await expect(page.locator("[aria-labelledby=error-summary-title]")).toBeFocused();
    await expect(page.getByRole("radio", { name: "Lån" })).toBeChecked();
    await expect(page.getByLabel("Tittel")).toHaveValue("ab");
    await expect(page).toHaveURL(/\/listings\/new$/);
  });
});

// Bredden på «Legg ut annonse» (#135). Godkjent av Max 11.10.
test("legg ut annonse: to kolonner på bred skjerm, kortet fyller høyden, én kolonne på mobil", async ({ page }) => {
  const box = async (locator: import("@playwright/test").Locator) => (await locator.boundingBox())!;
  const preview = page.getByRole("button", { name: "Legg til bilder" });
  const title = page.getByLabel("Tittel");

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/listings/new");
  const [wide, wideTitle] = [await box(preview), await box(title)];
  expect(wideTitle.x).toBeGreaterThan(wide.x + wide.width);
  expect(wideTitle.y).toBeLessThan(wide.y + wide.height);

  // Kortet går helt ned på en høy skjerm, med samme marg nederst som på sidene (48 px).
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto("/listings/new");
  const card = await box(page.locator("main > div"));
  expect(card.y + card.height).toBeGreaterThan(1400 - 60);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/listings/new");
  const [narrow, narrowTitle] = [await box(preview), await box(title)];
  expect(narrowTitle.y).toBeGreaterThan(narrow.y + narrow.height);
});
