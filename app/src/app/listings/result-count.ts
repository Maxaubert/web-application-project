// Teksten på «Vis X annonser»-knappen i filtrene (Max 10.10, #102). Uten tall (feil eller ugyldig
// verdi) står det bare «Vis annonser», så knappen aldri lover et tall som ikke stemmer.
export function showResultsLabel(count: number | null) {
  if (count === null) return "Vis annonser";
  return `Vis ${count} ${count === 1 ? "annonse" : "annonser"}`;
}
