// Søk og filtre som adresse uten tomme felt (#102): /?type=loan i stedet for
// /?q=&category=&type=loan&minPrice=&maxPrice=. Avkrysningene kan stå flere ganger (type=sale&type=loan).
type Entries = Iterable<[string, FormDataEntryValue]>;

export function searchQuery(entries: Entries) {
  const params = new URLSearchParams();
  for (const [key, value] of entries) if (typeof value === "string" && value !== "") params.append(key, value);
  return params.toString();
}

// Forsiden med søket. Skjemaet og filtrene bruker denne når JavaScript er på; uten JavaScript sender
// nettleseren skjemaet selv, med de tomme feltene, og serveren godtar begge.
export function searchPageUrl(entries: Entries) {
  const query = searchQuery(entries);
  return query ? `/?${query}` : "/";
}
