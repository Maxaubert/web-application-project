// Bla i bildene på annonsesiden (#156). Mockup godkjent av Max 12.10. Produksjonsbygget; testannonsen har to bilder,
// «Galleritest» seks (uten filer i R2, bare for miniatyrraden).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { AUTH_FILE, TEST_GALLERY_ID, TEST_LISTING_ID } from "./global-setup";

test.use({ storageState: AUTH_FILE });

const opacity = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).opacity);
const bigImage = (page: Page) => page.getByRole("img", { name: /^Skrivebordslampe/ });
const counter = (page: Page) => page.getByText(/^\d \/ \d$/);
const strip = (page: Page) => page.locator("[tabindex='-1'].snap-x");

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

  test("etter et museklikk på en pil gir tastetrykk ingen fokusring rundt pilen", async ({ page }) => {
    await bigImage(page).hover();
    const next = page.getByRole("button", { name: "Neste bilde" });

    await next.click();
    await page.keyboard.press("ArrowLeft");

    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    expect(await next.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });

  test("neste bilde er lastet før man blar, så det ikke blinker", async ({ page }) => {
    const second = page.locator("img[alt='Skrivebordslampe, bilde 2 av 2']");

    await expect.poll(() => second.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    // Bare det valgte bildet er synlig for skjermlesere.
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toHaveCount(0);
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
    // Rundtur: stripen står umiddelbart ved siste bilde i stedet for å rulle forbi alle de andre.
    const [left, width] = await strip(page).evaluate((el) => [el.scrollLeft, el.clientWidth]);
    expect(Math.abs(left - 5 * width)).toBeLessThanOrEqual(2);
  });

  test("et hopp til et fjernt bilde via miniatyren velger bare det bildet, uten å innom de på veien", async ({ page }) => {
    await page.goto(`/listings/${TEST_GALLERY_ID}`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { seen: string[] }).seen = seen;
      new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target as HTMLElement;
          if (target.getAttribute("aria-pressed") === "true") seen.push(target.getAttribute("aria-label") ?? "");
        }
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
    });

    await page.getByRole("button", { name: "Vis bilde 6 av 6" }).click();
    // Hoppet glir: rett etter klikket står stripen ennå ikke ved siste bilde.
    expect(await strip(page).evaluate((el) => el.scrollLeft < 5 * el.clientWidth - 2)).toBe(true);
    await expect
      .poll(() => strip(page).evaluate((el) => Math.abs(el.scrollLeft - 5 * el.clientWidth) <= 2))
      .toBe(true);
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => (window as unknown as { seen: string[] }).seen)).toEqual(["Vis bilde 6 av 6"]);
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
    for (let i = 0; i < 15 && !(await previous.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
      // Stripen er ikke et tabstopp; pilene og miniatyrene er det.
      expect(await page.evaluate(() => document.activeElement?.classList.contains("snap-x"))).toBe(false);
    }

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

  // Ekte berøringsbevegelse gjennom nettleserens inndata (CDP): fingeren flyttes i små steg, og nettleseren ruller og låser
  // selv. Negativ dx er fingeren mot venstre (neste bilde).
  async function swipe(page: Page, dx: number, dy = 0) {
    const box = (await bigImage(page).boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
    const [x0, y0] = [box.x + box.width / 2 - dx / 2, box.y + box.height / 2 - dy / 2];
    await touch("touchStart", x0, y0);
    for (let i = 1; i <= 10; i++) {
      await touch("touchMove", x0 + (dx * i) / 10, y0 + (dy * i) / 10);
      await page.waitForTimeout(16);
    }
    await touch("touchEnd", 0, 0);
  }

  test("bildene ligger i en stripe som glir og låses på hvert bilde, og et sveip bytter bilde", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });
    const track = strip(page);
    const { scrollWidth, clientWidth, snap, overflowX, scrollbar } = await track.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      snap: getComputedStyle(el).scrollSnapType,
      overflowX: getComputedStyle(el).overflowX,
      scrollbar: getComputedStyle(el).scrollbarWidth,
    }));
    // Begge bildene ligger ved siden av hverandre i DOM-en, og stripen låses på hvert.
    expect(scrollWidth).toBe(clientWidth * 2);
    expect(snap).toBe("x mandatory");
    expect(overflowX).toBe("auto");
    expect(scrollbar).toBe("none");
    // Hvert bilde er et låsepunkt midt i stripen, og rundingen av hjørnene klippes av omslaget.
    const slide = await track.locator("> div").first().evaluate((el) => ({ align: getComputedStyle(el).scrollSnapAlign, stop: getComputedStyle(el).scrollSnapStop }));
    expect(slide).toEqual({ align: "center", stop: "always" });
    const wrapper = await track.evaluate((el) => ({ overflow: getComputedStyle(el.parentElement!).overflow, radius: getComputedStyle(el.parentElement!).borderRadius }));
    expect(wrapper).toEqual({ overflow: "hidden", radius: "12px" });

    await swipe(page, -200);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 2 av 2" })).toBeVisible();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(clientWidth);

    await swipe(page, 200);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(counter(page)).toHaveText("1 / 2");
    await expect(page.getByRole("button", { name: "Vis bilde 1 av 2" })).toHaveAttribute("aria-pressed", "true");
  });

  test("et sveip som ikke er langt nok, går tilbake til bildet, og rulling opp og ned bytter ikke bilde", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });
    const track = strip(page);

    await swipe(page, -40);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);

    await swipe(page, 0, -150);
    await expect(page.getByRole("img", { name: "Skrivebordslampe, bilde 1 av 2" })).toBeVisible();
    expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test("pilene og miniatyrene ruller stripen med glid, og stripen følger med når bredden endres", async ({ page }) => {
    await page.goto(`/listings/${TEST_LISTING_ID}`, { waitUntil: "networkidle" });
    const track = strip(page);
    const width = await track.evaluate((el) => el.clientWidth);

    await page.keyboard.press("ArrowRight");
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(width);
    await page.setViewportSize({ width: 320, height: 700 });
    await expect.poll(async () => (await track.evaluate((el) => [el.scrollLeft, el.clientWidth])).join()).toMatch(/^(\d+),\1$/);
    await page.getByRole("button", { name: "Vis bilde 1 av 2" }).click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);
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
