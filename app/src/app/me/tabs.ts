// Fanene på Min side (FK-11). ?tab=favorites viser Mine favoritter (#224); alt annet, også en ukjent verdi, gir Forespørsler.
// Mine annonser (#189) og Historikk (#220) kommer som egne verdier.
export type Tab = "requests" | "favorites";

export function parseTab(value: string | null): Tab {
  return value === "favorites" ? "favorites" : "requests";
}
