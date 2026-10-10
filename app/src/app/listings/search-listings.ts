// Fuzzy søk i annonsene på forsiden (#97, Max 10.10): tittel, beskrivelse og selgerens navn,
// uten forskjell på store og små bokstaver (også æøå), og med plass til skrivefeil og delord.
// Kjører i Workeren på aktive annonser fra databasen; det holder for omtrent tusen annonser (KK-02).
import Fuse from "fuse.js";
import type { ListingWithOwner } from "./queries";

const fuseOptions = {
  // Treff i tittelen teller dobbelt så mye som i beskrivelsen og navnet. Fuse lar i tillegg
  // korte felt telle mer enn lange; det beholdes (Max 10.10).
  keys: [{ name: "listing.title", weight: 2 }, "listing.description", "ownerName"],
  // Omtrent feil bokstaver per bokstav i søkeordet: 0 krever eksakt treff, 1 godtar alt. 0.2 er én
  // skrivefeil per fem bokstaver: «kalkulater» treffer, men «telt» treffer ikke navnet «Test» (Max 10.10).
  threshold: 0.2,
  // Treffet kan stå hvor som helst i teksten, ikke bare i starten.
  ignoreLocation: true,
};

export function searchListings(rows: ListingWithOwner[], q: string): ListingWithOwner[] {
  // Uten søkeord beholdes rekkefølgen fra databasen, altså nyeste først.
  if (!q) return rows;
  // Fuse sorterer treffene etter hvor godt de passer, best treff først.
  return new Fuse(rows, fuseOptions).search(q).map((hit) => hit.item);
}
