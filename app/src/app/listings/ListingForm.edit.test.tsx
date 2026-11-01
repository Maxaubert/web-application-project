// Skjemaet i «Administrer»-modus (#229) slik det ser ut før noe er trykket. Godkjent av Max 24.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ListingForm } from "./ListingForm";

vi.mock("./actions", () => ({ createListing: vi.fn(), updateListing: vi.fn() }));

const edit = {
  listingId: "calc",
  values: { title: "Kalkulator", description: "Lite brukt.", category: "electronics", type: "sale", condition: "used", price: "250" },
  images: [{ id: "a", url: "/images/listings/calc/a.jpg", thumbUrl: "/images/listings/calc/a.thumb.jpg", stored: true as const }],
};

describe("ListingForm, Administrer", () => {
  const html = renderToStaticMarkup(<ListingForm ownerName="Ola Nordmann" edit={edit} />);

  it("sender annonsens id, heter «Lagre endringer» og har ikke «Publiser»", () => {
    expect(html).toContain('<input type="hidden" name="listingId" value="calc"/>');
    expect(html).toContain("Lagre endringer");
    expect(html).not.toContain("Publiser");
    expect(html).toMatch(/<a href="\/listings\/calc"[^>]*>Avbryt<\/a>/);
  });

  it("har låst handelstype og bildene uten «Legg til», fjern eller forsidevalg", () => {
    expect(html).toMatch(/<fieldset disabled=""[^>]*><legend[^>]*>Handelstype<\/legend>/);
    expect(html).not.toMatch(/Legg til|Fjern bilde|Gjør klar/);
    expect(html).toContain('aria-label="Bilde 1"');
  });
});
