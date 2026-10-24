// «Slett annonse» (#229) slik den ser ut før noe er trykket. Selve åpningen (klikk) dekkes av nettlesertesten.
// Godkjent av Max 24.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DeleteListingButton } from "./DeleteListingButton";

vi.mock("./actions", () => ({ takeDownListing: vi.fn() }));

describe("DeleteListingButton", () => {
  it("«Slett annonse» er en vanlig knapp som ikke sender skjemaet, og spørsmålet er skjult til man trykker", () => {
    const html = renderToStaticMarkup(<DeleteListingButton listingId="calc" />);

    expect(html).toMatch(/<button type="button"[^>]*>Slett annonse<\/button>/);
    expect(html).not.toMatch(/type="submit"|Slette annonsen\?|Ja, slett/);
    // Sprettoppvinduet finnes, men er lukket (Max 24.10: spørsmålet i et vindu, ikke under knappene).
    expect(html).toContain('aria-labelledby="delete-listing-title"');
    expect(html).not.toMatch(/<dialog[^>]* open/);
  });
});
