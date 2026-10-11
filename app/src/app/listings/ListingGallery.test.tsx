// Bildene på annonsesiden (#150). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListingGallery } from "./ListingGallery";

const render = (images: string[]) => renderToStaticMarkup(<ListingGallery images={images} title="Lampe" />);

describe("ListingGallery", () => {
  it("viser forsidebildet stort med tittelen som alt-tekst, og miniatyrer bare når det er flere bilder", () => {
    const one = render(["/images/a.jpg"]);
    expect(one).toMatch(/<img src="\/images\/a.jpg" alt="Lampe"/);
    expect(one).not.toContain("<button");

    const two = render(["/images/a.jpg", "/images/b.jpg"]);
    expect(two).toMatch(/<img src="\/images\/a.jpg" alt="Lampe, bilde 1 av 2"/);
    expect(two.match(/<button/g)).toHaveLength(2);
    expect(two).toMatch(/aria-label="Vis bilde 1 av 2" aria-pressed="true"/);
  });

  it("uten bilder vises plassholderen", () => {
    const html = render([]);
    expect(html).not.toContain("<img");
    expect(html).toContain('aria-hidden="true"');
  });
});
