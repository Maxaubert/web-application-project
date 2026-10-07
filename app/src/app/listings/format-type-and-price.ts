// Linjen med handelstype og pris på annonsekortet, som i wireframen WF-03:
// «Salg · 250 kr», «Lån · 40 kr/uke», «Lån · gratis», «Gis bort».
import type { Listing } from "@/db/schema";
import { typeLabels } from "./labels";

const kroner = new Intl.NumberFormat("nb-NO");

export function formatTypeAndPrice({ type, price }: Pick<Listing, "type" | "price">): string {
  const label = typeLabels[type];
  switch (type) {
    case "giveaway":
      return label;
    case "loan":
      return price ? `${label} · ${kroner.format(price)} kr/uke` : `${label} · gratis`;
    case "sale":
      // Salg uten pris skal ikke kunne lagres (valideres ved oppretting), men vises ærlig om det skjer.
      return price === null ? `${label} · pris mangler` : `${label} · ${kroner.format(price)} kr`;
  }
}
