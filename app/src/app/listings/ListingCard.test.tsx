// Kortet rendres til HTML på serveren, uten nettleser. Godkjent av Max 07.10 og 08.10 (lenken).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Listing } from "@/db/schema";
import { ListingCard } from "./ListingCard";

// Serverhandlingen bak hjertet (#224) trengs ikke for å tegne det.
vi.mock("@/app/favorites/actions", () => ({ toggleFavorite: vi.fn() }));

const tent: Listing = {
  id: "tent",
  ownerId: "owner-1",
  type: "loan",
  title: "Telt for to",
  description: "Lett telt, brukt to turer.",
  category: "sports",
  condition: "like_new",
  price: 40,
  status: "active",
  createdAt: new Date("2026-10-07"),
  updatedAt: new Date("2026-10-07"),
};

describe("ListingCard", () => {
  it("viser tittel som overskrift og type med pris, men ikke beskrivelsen", () => {
    const html = renderToStaticMarkup(<ListingCard listing={tent} cover={null} />);

    expect(html).toMatch(/<h2[^>]*>Telt for to<\/h2>/);
    expect(html).toContain("Lån · 40 kr/uke");
    expect(html).not.toContain("Lett telt");
  });

  it("lenker hele kortet til annonsesiden", () => {
    const html = renderToStaticMarkup(<ListingCard listing={tent} cover={null} />);

    expect(html).toMatch(/<a href="\/listings\/tent"[^>]*>[\s\S]*Telt for to[\s\S]*<\/a>/);
  });

  // Forsidebildet (#150). Godkjent av Max 11.10.
  it("viser forsidebildet uten egen alt-tekst, og plassholderen når annonsen ikke har bilde", () => {
    const withImage = renderToStaticMarkup(<ListingCard listing={tent} cover="/images/listings/x/y.jpg" />);
    expect(withImage).toMatch(/<img src="\/images\/listings\/x\/y.jpg" alt="" loading="lazy"/);

    const without = renderToStaticMarkup(<ListingCard listing={tent} cover={null} />);
    expect(without).not.toContain("<img");
    expect(without).toContain('aria-hidden="true"');
  });

  // Hjertet (#224). Godkjent av Max 24.10.
  it("viser hjertet med riktig tilstand utenfor lenken, og ikke noe hjerte uten favorite", () => {
    const saved = renderToStaticMarkup(<ListingCard listing={tent} cover={null} favorite />);
    expect(saved).toMatch(/<button[^>]*aria-pressed="true"[^>]*aria-label="Fjern fra favoritter"/);
    expect(saved.indexOf("aria-pressed")).toBeGreaterThan(saved.indexOf("</a>"));

    const unsaved = renderToStaticMarkup(<ListingCard listing={tent} cover={null} favorite={false} />);
    expect(unsaved).toMatch(/<button[^>]*aria-pressed="false"[^>]*aria-label="Lagre som favoritt"/);

    expect(renderToStaticMarkup(<ListingCard listing={tent} cover={null} />)).not.toContain("<button");
  });
});
