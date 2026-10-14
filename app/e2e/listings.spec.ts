// Nettlesertester som innlogget bruker (#94), mot produksjonsbygget. Økten og testannonsene legges inn
// av global-setup.ts. Godkjent av Max 10.10.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { AUTH_FILE, NO_THUMB_PATH, TEST_IMAGE_PATH, TEST_LISTING_ID, THUMB_IMAGE_PATH } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const FIXTURE_IMAGE = "e2e/fixtures/test.jpg";

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
    await page.getByLabel("Bilder").setInputFiles(FIXTURE_IMAGE);
    await expect(page.getByRole("button", { name: "Publiser", exact: true })).toBeEnabled();

    await page.getByRole("button", { name: "Publiser", exact: true }).click();

    await expect(page).toHaveURL(/\/listings\/[^/]+\?publisert=1$/);
    await expect(page.getByRole("status")).toHaveText("Annonsen er publisert og synlig i søket.");
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();

    await page.goto(`/?q=${encodeURIComponent(title)}`);
    await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();

    // Miniatyren som ble laget i nettleseren, vises på kortet (#155).
    const cover = page.getByRole("link", { name: new RegExp(title) }).locator("img");
    await expect(cover).toHaveAttribute("src", /\/images\/listings\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.thumb\.jpg$/);
    await expect.poll(() => loaded(cover)).toBe(true);
  });

  test("feil viser feilboksen med fokus, og valgene står igjen", async ({ page }) => {
    await page.getByLabel("Tittel").fill("ab");
    await page.getByRole("radio", { name: "Lån" }).check();
    await page.getByLabel("Pris per uke (kr, valgfri)").fill("100,-");

    await page.getByRole("button", { name: "Publiser", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Rett 6 feil før du publiserer" })).toBeVisible();
    await expect(page.locator("#images-error")).toHaveText("Legg til minst ett bilde");
    await expect(page.locator("[aria-labelledby=error-summary-title]")).toBeFocused();
    await expect(page.getByRole("radio", { name: "Lån" })).toBeChecked();
    await expect(page.getByLabel("Tittel")).toHaveValue("ab");
    await expect(page).toHaveURL(/\/listings\/new$/);
  });

  // Bildefeltet (#141). Godkjent av Max 11.10.
  test("bilder blir miniatyrer, et klikk gjør et bilde til forsidebilde, og ✕ fjerner det", async ({ page }) => {
    const [first, second] = [page.getByRole("button", { name: "Bilde 1", exact: true }), page.getByRole("button", { name: "Bilde 2", exact: true })];
    await page.getByLabel("Bilder").setInputFiles([FIXTURE_IMAGE, FIXTURE_IMAGE]);

    await expect(page.getByText("Forsidebilde")).toBeVisible();
    await expect(page.getByText("Gjør klar …")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Legg til bilder" })).toHaveCount(0);
    await expect(first).toHaveAttribute("aria-pressed", "true");
    const secondUrl = await second.evaluate((el) => getComputedStyle(el).backgroundImage);

    await second.click();
    expect(await first.evaluate((el) => getComputedStyle(el).backgroundImage)).toBe(secondUrl);

    await page.getByRole("button", { name: "Fjern bilde 2" }).click();
    await page.getByRole("button", { name: "Fjern bilde 1" }).click();
    await expect(page.getByRole("button", { name: "Legg til bilder" })).toBeVisible();
  });

  test("HEIC fra iPhone gjøres om til JPEG og skaleres ned til høyst 2000 px", async ({ page }) => {
    // 3000 × 2000 HEIC uten filtype, slik Windows ofte sender iPhone-bilder.
    await page.getByLabel("Bilder").setInputFiles({ name: "IMG_0001.HEIC", mimeType: "", buffer: readFileSync("e2e/fixtures/test.heic") });

    await expect(page.getByText("Gjør klar …")).toHaveCount(0, { timeout: 20_000 });
    // Forsidebildet først i DOM-en, miniatyren i raden under (#155).
    const sizes = await page.evaluate(async () => {
      const urls = [...document.querySelectorAll('[style*="blob:"]')].map((el) => getComputedStyle(el).backgroundImage.slice(5, -2));
      return Promise.all(
        urls.map(async (url) => {
          const blob = await (await fetch(url)).blob();
          const bitmap = await createImageBitmap(blob);
          return { type: blob.type, width: bitmap.width, height: bitmap.height };
        }),
      );
    });
    expect(sizes).toEqual([
      { type: "image/jpeg", width: 2000, height: 1333 },
      { type: "image/jpeg", width: 640, height: 427 },
    ]);

    // Publisert: det store bildet er 2000 px, og kortet i søket laster miniatyren på 640 px (#155).
    const title = `E2E-HEIC ${Date.now()}`;
    await page.getByLabel("Tittel").fill(title);
    await page.getByLabel("Beskrivelse").fill("Tatt med iPhone.");
    await page.getByLabel("Kategori").selectOption({ label: "Elektronikk" });
    await page.getByLabel("Pris (kr)").fill("100");
    await page.getByRole("radio", { name: "Brukt" }).check();
    await page.getByRole("button", { name: "Publiser", exact: true }).click();

    await expect(page).toHaveURL(/\/listings\/[^/]+\?publisert=1$/);
    const big = page.getByRole("img", { name: title });
    await expect.poll(() => big.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(2000);

    await page.goto(`/?q=${encodeURIComponent(title)}`);
    const cover = page.getByRole("link", { name: new RegExp(title) }).locator("img");
    await expect.poll(() => cover.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(640);
  });

  test("filer som ikke er bilder, legges ikke til og står i en rød boks", async ({ page }) => {
    await page.getByLabel("Bilder").setInputFiles([
      { name: "test.jpg", mimeType: "image/jpeg", buffer: readFileSync(FIXTURE_IMAGE) },
      { name: "ferie.mov", mimeType: "video/quicktime", buffer: Buffer.from("ikke et bilde") },
    ]);

    await expect(page.getByRole("alert")).toHaveText("1 fil ble ikke lagt til:ferie.mov: bare bilder (JPEG, PNG, WebP eller HEIC)");
    await expect(page.getByRole("button", { name: /^Bilde \d$/ })).toHaveCount(1);
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

  // Parene står side om side allerede på 1280 px, så feltkolonnen ikke blir mye høyere enn forhåndsvisningen (#146).
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/listings/new");
  const [category, sale] = [await box(page.getByLabel("Kategori")), await box(page.getByRole("radio", { name: "Salg" }))];
  const [price, used] = [await box(page.getByLabel("Pris (kr)")), await box(page.getByRole("radio", { name: "Brukt" }))];
  expect(sale.x).toBeGreaterThan(category.x + category.width);
  expect(used.x).toBeGreaterThan(price.x + price.width);
  expect(Math.abs(sale.y + sale.height / 2 - (category.y + category.height / 2))).toBeLessThan(20);
  const lastField = await box(page.getByRole("radio", { name: "Brukt" }));
  const thumbs = await box(page.getByRole("button", { name: "Legg til", exact: true }));
  expect(lastField.y + lastField.height).toBeLessThan(thumbs.y + thumbs.height + 80);

  // Kortet går helt ned på en høy skjerm, med samme marg nederst som på sidene (48 px).
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto("/listings/new");
  const card = await box(page.locator("main > div"));
  expect(card.y + card.height).toBeGreaterThan(1400 - 60);

  // Knappene nederst til høyre i kortet, «Avbryt» til venstre for «Publiser annonse».
  const publish = await box(page.getByRole("button", { name: "Publiser", exact: true }));
  const cancel = await box(page.getByRole("link", { name: "Avbryt" }));
  expect(card.x + card.width - (publish.x + publish.width)).toBeLessThan(60);
  expect(card.y + card.height - (publish.y + publish.height)).toBeLessThan(60);
  expect(cancel.x + cancel.width).toBeLessThanOrEqual(publish.x);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/listings/new");
  // Under 640 px er forhåndsvisningen skjult (#169); miniatyrraden med «Legg til» står over feltene.
  await expect(preview).toBeHidden();
  const [narrow, narrowTitle] = [await box(page.getByRole("button", { name: "Legg til", exact: true })), await box(title)];
  expect(narrowTitle.y).toBeGreaterThan(narrow.y + narrow.height);
});

// Bildeadressen mot den lokale R2-emuleringen (#138). Godkjent av Max 11.10.
test("innlogget bruker får annonsebildet fra R2, og ukjent bilde gir 404", async ({ page }) => {
  const response = await page.request.get(TEST_IMAGE_PATH);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/jpeg");
  expect(Buffer.from(await response.body()).toString("hex", 0, 3)).toBe("ffd8ff");

  const missing = await page.request.get(TEST_IMAGE_PATH.replace("0002.jpg", "0009.jpg"));
  expect(missing.status()).toBe(404);

  // Miniatyren når den finnes, og originalen når den mangler (#155).
  const thumb = await page.request.get(THUMB_IMAGE_PATH);
  expect(thumb.status()).toBe(200);
  expect(thumb.headers()["content-type"]).toBe("image/jpeg");
  expect((await thumb.body()).length).toBe(readFileSync("e2e/fixtures/test.thumb.jpg").length);
  const fallback = await page.request.get(NO_THUMB_PATH);
  expect(fallback.status()).toBe(200);
  expect((await fallback.body()).length).toBe(readFileSync("e2e/fixtures/test.jpg").length);
  expect((await page.request.get(THUMB_IMAGE_PATH.replace("0002.thumb.jpg", "0009.thumb.jpg"))).status()).toBe(404);
});

// Bildene i appen (#150). Godkjent av Max 11.10.
const loaded = (img: import("@playwright/test").Locator) => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);

test("kortet og søkeforslaget viser forsidebildet, og annonser uten bilde har plassholderen", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Skrivebordslampe/ });
  const cover = card.locator("img");
  await expect(cover).toHaveAttribute("src", THUMB_IMAGE_PATH);
  await cover.scrollIntoViewIfNeeded();
  await expect.poll(() => loaded(cover)).toBe(true);
  await expect(page.getByRole("link", { name: /Kalkulator Casio fx-991/ }).locator("img")).toHaveCount(0);

  await page.waitForLoadState("networkidle");
  await page.getByLabel("Søk i tittel, beskrivelse og selger").fill("skrivebord");
  const option = page.getByRole("option", { name: /Skrivebordslampe/ });
  await expect(option.locator("img")).toHaveAttribute("src", THUMB_IMAGE_PATH);
});

test("annonsesiden viser forsidebildet stort, og et klikk på en miniatyr viser den stort", async ({ page }) => {
  await page.goto(`/listings/${TEST_LISTING_ID}`);
  const big = page.getByRole("img", { name: /^Skrivebordslampe/ });
  await expect(big).toHaveAttribute("src", TEST_IMAGE_PATH);
  await expect.poll(() => loaded(big)).toBe(true);
  await expect(page.getByRole("button", { name: "Vis bilde 1 av 2" })).toHaveAttribute("aria-pressed", "true");
  // Miniatyrraden bruker miniatyrene, det store bildet originalen (#155).
  await expect(page.getByRole("button", { name: "Vis bilde 1 av 2" })).toHaveCSS("background-image", new RegExp(`${THUMB_IMAGE_PATH}`));
  await expect(page.getByRole("button", { name: "Vis bilde 2 av 2" })).toHaveCSS("background-image", new RegExp(`${NO_THUMB_PATH}`));

  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Vis bilde 2 av 2" }).click();

  await expect(big).toHaveAttribute("src", TEST_IMAGE_PATH.replace("0002.jpg", "0003.jpg"));
  await expect(big).toHaveAccessibleName("Skrivebordslampe, bilde 2 av 2");
  await expect(page.getByRole("button", { name: "Vis bilde 2 av 2" })).toHaveAttribute("aria-pressed", "true");
});

test("annonse uten bilder viser plassholderen og ingen miniatyrer", async ({ page }) => {
  await page.goto("/listings/e2e-calc");
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Vis bilde/ })).toHaveCount(0);
});
