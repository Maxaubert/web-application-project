// Kategoriraden (#288). Godkjent av Max 04.11.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CategoryLinks } from "./CategoryLinks";

const none = { type: [], condition: [] };

describe("CategoryLinks", () => {
  it("lenkene beholder søkeordet og de andre filtrene", () => {
    const html = renderToStaticMarkup(
      <CategoryLinks q="mac" filters={{ type: ["sale"], condition: [], maxPrice: 500 }} available={["electronics"]} />,
    );

    expect(html).toContain('href="/?q=mac&amp;category=electronics&amp;type=sale&amp;maxPrice=500"');
  });

  it("den valgte kategorien er markert, og «Alle» fjerner bare kategorien", () => {
    const html = renderToStaticMarkup(<CategoryLinks q="mac" filters={{ ...none, category: "books" }} available={["books"]} />);

    expect(html).toMatch(/<a href="[^"]*category=books"[^>]*aria-current="true"/);
    expect(html).toMatch(/<a href="\/\?q=mac"(?![^>]*aria-current)[^>]*>Alle/);
  });

  it("bare kategorier med annonser vises", () => {
    const html = renderToStaticMarkup(<CategoryLinks q="" filters={none} available={["books"]} />);

    expect(html).toContain("Bøker og pensum");
    expect(html).not.toContain("Elektronikk");
  });
});
