// Mini-forhåndsvisningen i «Legg ut annonse» (#133). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ListingFormValues } from "./listing-schema";
import { ListingPreview } from "./ListingPreview";

const EMPTY: ListingFormValues = { title: "", description: "", category: "", type: "sale", condition: "", price: "" };
const render = (values: Partial<ListingFormValues>) => renderToStaticMarkup(<ListingPreview values={{ ...EMPTY, ...values }} />);

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

  it("gis bort viser ingen pris, og bildeknappen er låst med forklaring", () => {
    const html = render({ type: "giveaway", price: "500" });

    expect(html).not.toContain("500");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-describedby="images-soon"/);
    expect(html).toContain("Bildeopplasting kommer snart.");
  });
});
