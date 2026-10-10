// Teksten på «Vis X annonser»-knappen som lukker filterarket på mobil (Max 10.10, #102, #122).
export function showResultsLabel(count: number) {
  return `Vis ${count} ${count === 1 ? "annonse" : "annonser"}`;
}
