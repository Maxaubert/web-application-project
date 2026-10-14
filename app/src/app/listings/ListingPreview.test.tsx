// Mini-forhåndsvisningen i «Legg ut annonse» (#133). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ListingFormValues } from "./listing-schema";
import { ListingPreview } from "./ListingPreview";

const EMPTY: ListingFormValues = { title: "", description: "", category: "", type: "sale", condition: "", price: "" };
const render = (values: Partial<ListingFormValues>, invalid = false) =>
  renderToStaticMarkup(<ListingPreview values={{ ...EMPTY, ...values }} photo={<div id="photo" />} invalid={invalid} />);

describe("ListingPreview", () => {
  it("viser det som er skrevet, med samme pristekst som annonsesiden", () => {
    const html = render({ title: "Skjerm", type: "loan", price: "100", category: "electronics", condition: "used" });

    for (const text of ["Lån", "Skjerm", "100 kr/uke", "Elektronikk · Brukt"]) expect(html).toContain(text);
  });

  it("tomme felt vises som grå plassholdere, og tomt lån er gratis", () => {
    const sale = render({});
    expect(sale).toMatch(/text-muted">Tittel</);
    expect(sale).toMatch(/text-muted">Pris</);
    expect(sale).toContain("Kategori · Tilstand");
    expect(render({ type: "loan" })).toContain("Gratis");
  });

  it("gis bort viser ingen pris", () => {
    expect(render({ type: "giveaway", price: "500" })).not.toContain("500");
  });

  // Bildeflaten fra ImageField og rød kant uten bilde (#141). Godkjent av Max 11.10.
  it("viser bildeflaten øverst i kortet, og får rød kant når bildet mangler", () => {
    expect(render({})).toMatch(/^<div class="[^"]*border-hairline[^"]*"><div id="photo"><\/div>/);
    expect(render({}, true)).toMatch(/^<div class="[^"]*border-2 border-danger/);
    expect(render({}, true)).not.toMatch(/^<div class="[^"]*border-hairline/);
  });
});
