// Egen lokal lagring (D1 og R2) for nettlesertestene (#154), så testkjøringer ikke legger igjen annonser i
// databasen som `npm run dev` bruker. Forhåndsvisningsserveren får mappen via E2E_STATE (vite.config.mts).
export const E2E_STATE = ".wrangler/e2e-state";
