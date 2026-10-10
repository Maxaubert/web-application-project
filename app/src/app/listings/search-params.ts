// Leser søket fra adressen på forsiden (?q=). URL-en kan skrives av hvem som helst, så den
// valideres på serveren selv om skjemaet bare kan sende gyldige verdier. Filtre kommer i #102.
import { z } from "zod";

export const SEARCH_MAX_LENGTH = 100;

export const searchSchema = z.object({
  q: z.string().trim().max(SEARCH_MAX_LENGTH).default(""),
});

export type Search = z.infer<typeof searchSchema>;

export function parseSearch(url: URL) {
  return searchSchema.safeParse(Object.fromEntries(url.searchParams));
}
