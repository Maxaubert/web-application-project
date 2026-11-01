// Fanene på Min side (FK-11). ?tab=listings viser Mine annonser (#229), ?tab=history Historikk (#220) og ?tab=favorites
// Mine favoritter (#224); alt annet, også en ukjent verdi, gir Forespørsler.
export type Tab = "requests" | "listings" | "history" | "favorites";

export function parseTab(value: string | null): Tab {
  return value === "listings" || value === "history" || value === "favorites" ? value : "requests";
}
