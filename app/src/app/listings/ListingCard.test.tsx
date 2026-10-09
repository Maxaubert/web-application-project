// Kortet rendres til HTML på serveren, uten nettleser. Godkjent av Max 07.10 og 08.10 (lenken).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Listing } from "@/db/schema";
import { ListingCard } from "./ListingCard";

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
    const html = renderToStaticMarkup(<ListingCard listing={tent} />);

    expect(html).toMatch(/<h2[^>]*>Telt for to<\/h2>/);
    expect(html).toContain("Lån · 40 kr/uke");
    expect(html).not.toContain("Lett telt");
  });

  it("lenker hele kortet til annonsesiden", () => {
    const html = renderToStaticMarkup(<ListingCard listing={tent} />);

    expect(html).toMatch(/<a href="\/listings\/tent"[^>]*>[\s\S]*Telt for to[\s\S]*<\/a>/);
  });
});
