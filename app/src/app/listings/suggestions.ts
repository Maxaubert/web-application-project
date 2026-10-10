// Ren logikk for live søkeforslag (#104, Max 10.10): når det skal hentes, og hvordan markeringen
// flyttes med piltastene. Uten React, så den kan testes i Vitest.
import type { Listing } from "@/db/schema";

export const MIN_CHARS = 2;
export const SUGGESTION_LIMIT = 5;
export const DEBOUNCE_MS = 200;

// Feltene API-et sender for hver annonse (GET /api/listings, #98) som forslagene bruker.
export type Suggestion = Pick<Listing, "id" | "title" | "type" | "price">;

// Adressen forslagene hentes fra, eller null når søkeordet er for kort til å hente.
export function suggestionsUrl(q: string): string | null {
  const term = q.trim();
  if (term.length < MIN_CHARS) return null;
  return `/api/listings?q=${encodeURIComponent(term)}&limit=${SUGGESTION_LIMIT}`;
}

// Neste markerte rad. -1 betyr ingen markering; piltastene ruller rundt i begge retninger.
export function moveActive(current: number, step: 1 | -1, count: number): number {
  if (count === 0) return -1;
  if (current < 0) return step === 1 ? 0 : count - 1;
  return (current + step + count) % count;
}
