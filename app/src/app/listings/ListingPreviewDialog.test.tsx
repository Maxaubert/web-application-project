// Forhåndsvisningen i «Legg ut annonse» (#171). Dialogen åpnes og lukkes i nettleseren; her sjekkes innholdet.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ListingFormValues } from "./listing-schema";
import { ListingPreviewDialog } from "./ListingPreviewDialog";

const VALUES: ListingFormValues = { title: "Skrivebordslampe", description: "Lite brukt.", category: "furniture", type: "sale", condition: "used", price: "120" };
const render = (open: boolean) =>
  renderToStaticMarkup(
    <ListingPreviewDialog open={open} onClose={() => {}} values={VALUES} images={[{ src: "/a.jpg", thumb: "/a.thumb.jpg" }]} ownerName="Max Aubert" busy={false} publishLabel="Publiser" />,
  );

describe("ListingPreviewDialog", () => {
  it("viser annonsesiden med det som er skrevet, selgeren og bildet", () => {
    const html = render(true);

    for (const text of ["Skrivebordslampe", "120 kr", "Lite brukt.", "Møbler", "Brukt", "Selger", "Max Aubert"]) expect(html).toContain(text);
    expect(html).toContain('src="/a.jpg"');
  });

  it("har bare «Avbryt» og «Publiser» nederst, og ingen lenke ut av skjemaet", () => {
    const html = render(true);

    expect(html).toMatch(/<button type="button"[^>]*>Avbryt<\/button>/);
    expect(html).toMatch(/<button type="submit"[^>]*>Publiser<\/button>/);
    expect(html).not.toContain("Tilbake til annonser");
    expect(html).not.toContain("<a ");
  });

  it("er tom når den er lukket, så den ikke dobler knappene eller teksten i skjemaet", () => {
    const html = render(false);

    expect(html).toContain("<dialog");
    expect(html).not.toContain("Skrivebordslampe");
    expect(html).not.toContain("Publiser");
  });

  it("«Publiser» er låst mens skjemaet sendes", () => {
    const html = renderToStaticMarkup(
      <ListingPreviewDialog open onClose={() => {}} values={VALUES} images={[]} ownerName="Max" busy publishLabel="Publiserer …" />,
    );

    expect(html).toMatch(/<button type="submit" disabled=""[^>]*>Publiserer …<\/button>/);
  });
});
