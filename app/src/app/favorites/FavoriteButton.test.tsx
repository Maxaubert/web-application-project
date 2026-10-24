// Hjertet (#224) slik det ser ut før noe er trykket. Selve klikket og at hjertet snur, dekkes av nettlesertesten.
// Godkjent av Max 24.10.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FavoriteButton } from "./FavoriteButton";

vi.mock("./actions", () => ({ toggleFavorite: vi.fn() }));

describe("FavoriteButton", () => {
  it("et ulagret hjerte sender «on» og heter «Lagre som favoritt»", () => {
    const html = renderToStaticMarkup(<FavoriteButton listingId="calc" saved={false} />);

    expect(html).toContain('<input type="hidden" name="listingId" value="calc"/>');
    expect(html).toMatch(/<button type="submit"(?=[^>]*name="intent")(?=[^>]*value="on")(?=[^>]*aria-pressed="false")(?=[^>]*aria-label="Lagre som favoritt")/);
  });

  it("et lagret hjerte sender «off» og heter «Fjern fra favoritter»", () => {
    const html = renderToStaticMarkup(<FavoriteButton listingId="calc" saved />);

    expect(html).toMatch(/<button type="submit"(?=[^>]*value="off")(?=[^>]*aria-pressed="true")(?=[^>]*aria-label="Fjern fra favoritter")/);
  });
});
