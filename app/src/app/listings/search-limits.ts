// Grenser for søk, filtre og nye annonser, i egen fil fordi klientkomponentene trenger dem. search-params.ts drar
// inn Zod og databaseskjemaet, som ikke skal med i nettleserens JavaScript.
export const SEARCH_MAX_LENGTH = 100;
// Høyeste pris i kroner, både for nye annonser og i prisfilteret (Max 11.10, #131).
export const PRICE_MAX = 100_000;
