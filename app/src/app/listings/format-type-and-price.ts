// Pris og handelstype som tekst, som i wireframene.
// Annonsesiden (WF-04) viser prisen alene: «250 kr», «40 kr/uke», «Gratis».
// Kortet (WF-03) viser type og pris i én linje: «Salg · 250 kr», «Lån · gratis», «Gis bort».
import type { Listing } from "@/db/schema";
import { typeLabels } from "./labels";

const kroner = new Intl.NumberFormat("nb-NO");

type PriceFields = Pick<Listing, "type" | "price">;

// Gis bort har ingen pris, så da blir det ingenting å vise.
export function formatPrice({ type, price }: PriceFields): string | null {
  switch (type) {
    case "giveaway":
      return null;
    case "loan":
      return price ? `${kroner.format(price)} kr/uke` : "Gratis";
    case "sale":
      // Salg uten pris skal ikke kunne lagres (valideres ved oppretting), men vises ærlig om det skjer.
      return price === null ? "Pris mangler" : `${kroner.format(price)} kr`;
  }
}

export function formatTypeAndPrice(listing: PriceFields): string {
  const label = typeLabels[listing.type];
  const price = formatPrice(listing);
  // Midt i linjen skrives prisen med liten forbokstav: «Lån · gratis».
  return price === null ? label : `${label} · ${price.toLowerCase()}`;
}
