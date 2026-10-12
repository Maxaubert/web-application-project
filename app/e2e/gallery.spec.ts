// Bla i bildene på annonsesiden (#156). Mockup godkjent av Max 12.10. Produksjonsbygget; testannonsen har to bilder,
// «Galleritest» seks (uten filer i R2, bare for miniatyrraden).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { AUTH_FILE, TEST_GALLERY_ID, TEST_LISTING_ID } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const opacity = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).opacity);
const bigImage = (page: Page) => page.getByRole("img", { name: /^Skrivebordslampe/ });
const counter = (page: Page) => page.getByText(/^\d \/ \d$/);

test.describe("desktop (1280 px)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });
  });

  test("pilene og telleren vises bare når musen er over bildet", async ({ page }) => {
    const next = page.getByRole("button", { name: "Neste bilde" });
    expect(await opacity(next)).toBe("0");
    expect(await opacity(counter(page))).toBe("0");

    await bigImage(page).hover();

    await expect.poll(() => opacity(next)).toBe("1");
    await expect.poll(() => opacity(page.getByRole("button", { name: "Forrige bilde" }))).toBe("1");
    await expect.poll(() => opacity(counter(page))).toBe("1");
    await expect(counter(page)).toHaveText("1 / 2");
    expect(await next.boundingBox()).toMatchObject({ width: 44, height: 44 });
  });

  test("pilene blar med rundtur, telleren og miniatyren følger med, og et museklikk gir ingen fokusring", async ({ page }) => {
    await bigImage(page).hover();
    const next = page.getByRole("button", { name: "Neste bilde" });

    await next.click();

    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
    await expect(counter(page)).toHaveText("2 / 2");
    await expect(page.getByRole("button", { name: "Vis bilde 2 av 2" })).toHaveAttribute("aria-pressed", "true");
    expect(await next.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");

    await next.click();
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    await page.getByRole("button", { name: "Forrige bilde" }).click();
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
  });

  test("«Neste» går fram og «Forrige» tilbake, også når det er flere enn to bilder", async ({ page }) => {
    await page.goto(`/listings/${TEST_GALLERY_ID}`, { waitUntil: "networkidle" });
    const image = (n: number) => page.getByRole("img", { name: `Galleritest, bilde ${n} av 6` });
    await page.getByRole("img", { name: /^Galleritest/ }).hover();

    await page.getByRole("button", { name: "Neste bilde" }).click();
    await expect(image(2)).toBeVisible();
    await page.getByRole("button", { name: "Neste bilde" }).click();
    await expect(image(3)).toBeVisible();
    await page.getByRole("button", { name: "Forrige bilde" }).click();
    await expect(image(2)).toBeVisible();
    await page.getByRole("button", { name: "Forrige bilde" }).click();
    await page.getByRole("button", { name: "Forrige bilde" }).click();
    await expect(image(6)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(image(1)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(image(6)).toBeVisible();
  });

  test("venstre og høyre piltast blar overalt på siden, men ikke med Alt eller mens man skriver", async ({ page }) => {
    // Tasten skal ikke også rulle siden sidelengs: standardhandlingen stoppes.
    await page.evaluate(() => {
      (window as unknown as { prevented: boolean[] }).prevented = [];
      window.addEventListener("keydown", (event) => (window as unknown as { prevented: boolean[] }).prevented.push(event.defaultPrevented));
    });
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { prevented: boolean[] }).prevented)).toEqual([true]);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
    // Pilene og telleren vises mens man bruker tastene.
    await expect.poll(() => opacity(counter(page))).toBe("1");

    await page.keyboard.press("Alt+ArrowLeft");
    await page.keyboard.press("Shift+ArrowLeft");
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();

    await page.evaluate(() => {
      const input = document.createElement("input");
      input.setAttribute("aria-label", "Notat");
      document.body.insertBefore(input, document.body.firstChild);
      input.focus();
    });
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
  });

  test("tastaturfokus på en pil viser pilene med fokusring", async ({ page }) => {
    const previous = page.getByRole("button", { name: "Forrige bilde" });
    for (let i = 0; i < 15 && !(await previous.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");

    await expect(previous).toBeFocused();
    await expect.poll(() => opacity(previous)).toBe("1");
    await expect.poll(() => opacity(page.getByRole("button", { name: "Neste bilde" }))).toBe("1");
    expect(await previous.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });

  test("en annonse med ett bilde har ingen piler og ingen teller", async ({ page }) => {
    await page.goto(`/listings/e2e-calc`, { waitUntil: "networkidle" });

    await expect(page.getByRole("button", { name: "Neste bilde" })).toHaveCount(0);
    await expect(page.getByText(/^\d \/ \d$/)).toHaveCount(0);
  });
});

test.describe("mobil (375 px)", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  const swipe = (page: Page, dx: number, dy: number, pointerType = "touch") =>
    bigImage(page).evaluate(
      (el, { dx, dy, pointerType }) => {
        const box = el.getBoundingClientRect();
        const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
        const fire = (type: string, cx: number, cy: number) =>
          el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType, clientX: cx, clientY: cy, isPrimary: true }));
        fire("pointerdown", x, y);
        fire("pointerup", x + dx, y + dy);
      },
      { dx, dy, pointerType },
    );

  test("sveip blar, men ikke rulling opp og ned eller et museslep", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });

    // Nettleseren tar vertikal rulling selv, og sidelengs bevegelse kommer til koden.
    expect(await bigImage(page).evaluate((el) => getComputedStyle(el.parentElement!).touchAction)).toBe("pan-y");

    await swipe(page, -90, 6);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
    await swipe(page, 90, -6);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();

    await swipe(page, -60, 120);
    await swipe(page, -90, 0, "mouse");
    await swipe(page, -20, 0);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
  });

  test("et trykk på bildet viser pilene en stund, og de skjules av seg selv", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });
    const next = page.getByRole("button", { name: "Neste bilde" });
    expect(await opacity(next)).toBe("0");

    // Et trykk på en skjult pil bytter ikke bilde, det viser bare pilene.
    const box = (await bigImage(page).boundingBox())!;
    await page.touchscreen.tap(box.x + box.width - 12 - 22, box.y + box.height / 2);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();

    await expect.poll(() => opacity(next)).toBe("1");
    await expect.poll(() => opacity(counter(page))).toBe("1");
    await expect.poll(() => opacity(next), { timeout: 8000 }).toBe("0");
  });

  test("miniatyrraden rulles så valgt miniatyr er synlig, og siden hopper ikke", async ({ page }) => {
    // Lav skjerm, så miniatyrraden ligger under synlig område og en scrollIntoView ved første visning ville flyttet siden.
    await page.setViewportSize({ width: 375, height: 360 });
    await page.goto(`/listings/${TEST_GALLERY_ID}`, { waitUntil: "networkidle" });
    const row = page.getByRole("button", { name: /^Vis bilde 1 av 6$/ }).locator("..");
    expect(await row.evaluate((el) => el.scrollLeft)).toBe(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");

    const last = page.getByRole("button", { name: "Vis bilde 6 av 6" });
    await expect(last).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => {
      const [rowBox, lastBox] = [await row.boundingBox(), await last.boundingBox()];
      return lastBox!.x >= rowBox!.x && lastBox!.x + lastBox!.width <= rowBox!.x + rowBox!.width + 1;
    }).toBe(true);
    expect(await row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
