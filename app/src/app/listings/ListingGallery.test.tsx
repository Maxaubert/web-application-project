// Bildene på annonsesiden (#150). Godkjent av Max 11.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListingGallery } from "./ListingGallery";

const photo = (name: string) => ({ src: `/images/${name}.jpg`, thumb: `/images/${name}.thumb.jpg` });
const render = (names: string[]) => renderToStaticMarkup(<ListingGallery images={names.map(photo)} title="Lampe" />);

describe("ListingGallery", () => {
  it("viser forsidebildet stort med tittelen som alt-tekst, og miniatyrer bare når det er flere bilder", () => {
    const one = render(["a"]);
    expect(one).toMatch(/<img src="\/images\/a.jpg" alt="Lampe"/);
    expect(one).not.toContain("<button");

    const two = render(["a", "b"]);
    expect(two).toMatch(/<img src="\/images\/a.jpg" alt="Lampe, bilde 1 av 2"/);
    expect(two.match(/aria-label="Vis bilde \d av 2"/g)).toHaveLength(2);
    expect(two).toMatch(/aria-label="Vis bilde 1 av 2" aria-pressed="true"/);
  });

  // Miniatyrene (#155): raden bruker de små bildene, det store bildet originalen.
  it("miniatyrraden bruker miniatyrene, og det store bildet originalen", () => {
    const html = render(["a", "b"]);

    expect(html).toContain("url(/images/a.thumb.jpg)");
    expect(html).toContain("url(/images/b.thumb.jpg)");
    expect(html).toContain('<img src="/images/a.jpg"');
    expect(html).not.toContain("url(/images/a.jpg)");
  });

  // Piler og teller (#156). Mockup godkjent av Max 12.10.
  it("flere bilder har piler med navn og en teller, og pilene står i siden selv når de er skjult", () => {
    const html = render(["a", "b", "c"]);

    expect(html).toMatch(/<button type="button" aria-label="Forrige bilde"/);
    expect(html).toMatch(/<button type="button" aria-label="Neste bilde"/);
    expect(html).toMatch(/aria-hidden="true"[^>]*>1 \/ 3<\/span>/);
    expect(html.match(/opacity-0/g)!.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain("pointer-events-none");
  });

  it("ett bilde og ingen bilder har ingen piler og ingen teller", () => {
    for (const names of [["a"], []]) {
      const html = render(names);
      expect(html).not.toContain("Forrige bilde");
      expect(html).not.toContain("Neste bilde");
      expect(html).not.toMatch(/\d \/ \d/);
    }
  });

  it("uten bilder vises plassholderen", () => {
    const html = render([]);
    expect(html).not.toContain("<img");
    expect(html).toContain('aria-hidden="true"');
  });
});
