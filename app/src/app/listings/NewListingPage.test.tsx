// Skjermbildet «Legg ut annonse» (#133). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NewListingPage } from "./NewListingPage";

// Serverhandlingen og utloggingen trengs ikke for å tegne siden.
vi.mock("./actions", () => ({ createListing: vi.fn() }));
vi.mock("@/app/auth/LogoutButton", () => ({ LogoutButton: () => null }));

describe("NewListingPage", () => {
  const html = renderToStaticMarkup(<NewListingPage />);

  it("har fanetittel, overskrift og alle feltene med etikett, i godkjent rekkefølge", () => {
    expect(html).toContain("<title>Legg ut annonse – Studentmarkedet</title>");
    expect(html).toMatch(/<h1[^>]*>Legg ut annonse<\/h1>/);
    const order = ['for="listing-title"', 'for="listing-description"', 'for="listing-category"', ">Handelstype<", 'for="listing-price"', ">Tilstand<"];
    const positions = order.map((text) => html.indexOf(text));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("starter med salg, så prisen er påkrevd salgspris", () => {
    expect(html).toMatch(/<input[^>]*value="sale"[^>]*checked=""|<input[^>]*checked=""[^>]*value="sale"/);
    expect(html).toContain("Pris (kr)");
  });

  // Hint over feltet og teller under (#135). Godkjent av Max 11.10.
  it("tittel og beskrivelse har hint over feltet, teller under, og beskrivelsen kan ikke dras større", () => {
    for (const [id, max] of [["listing-title", 80], ["listing-description", 2000]] as const) {
      const hint = html.indexOf(`id="${id}-hint"`);
      const field = html.indexOf(`id="${id}"`);
      const count = html.indexOf(`id="${id}-count"`);
      expect(hint).toBeGreaterThan(-1);
      expect(hint).toBeLessThan(field);
      expect(field).toBeLessThan(count);
      expect(html).toContain(`0 av ${max} tegn`);
    }
    expect(html).toMatch(/<textarea[^>]*class="[^"]*resize-none/);
  });

  it("knappen «Legg ut annonse» i toppen er markert som siden man står på", () => {
    expect(html).toMatch(/<a[^>]*href="\/listings\/new"[^>]*aria-current="page"/);
  });
});
