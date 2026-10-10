// Grenser for søk og filtre, i egen fil fordi klientkomponentene trenger dem. search-params.ts drar
// inn Zod og databaseskjemaet, som ikke skal med i nettleserens JavaScript.
export const SEARCH_MAX_LENGTH = 100;
export const PRICE_MAX = 1_000_000;
