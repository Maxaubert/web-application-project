// Feilboksen øverst i skjemaet (#133). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorSummary } from "./ErrorSummary";

const FIELD_IDS = { title: "listing-title", description: "listing-description", price: "listing-price" };

describe("ErrorSummary", () => {
  it("viser antallet og feilene i feltenes rekkefølge, som lenker til feltet", () => {
    const html = renderToStaticMarkup(
      <ErrorSummary errors={{ price: "Skriv en pris", title: "Skriv en tittel" }} fieldIds={FIELD_IDS} action="publiserer" />,
    );

    expect(html).toContain("Rett 2 feil før du publiserer");
    expect(html.indexOf("Skriv en tittel")).toBeLessThan(html.indexOf("Skriv en pris"));
    expect(html).toContain('href="#listing-title"');
    expect(html).toContain('href="#listing-price"');
  });

  it("viser ingenting uten feil", () => {
    expect(renderToStaticMarkup(<ErrorSummary errors={{}} fieldIds={FIELD_IDS} action="publiserer" />)).toBe("");
  });
});
