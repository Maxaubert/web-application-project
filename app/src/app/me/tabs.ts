// Fanene på Min side (FK-11). ?tab=listings viser Mine annonser (#229) og ?tab=favorites Mine favoritter (#224); alt annet,
// også en ukjent verdi, gir Forespørsler. Historikk (#220) kommer som egen verdi.
export type Tab = "requests" | "listings" | "favorites";

export function parseTab(value: string | null): Tab {
  return value === "listings" || value === "favorites" ? value : "requests";
}
