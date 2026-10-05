// Runde flagg fra circle-flags (MIT, HatScripts), servert fra vår egen app fra /flags/.
// scripts/copy-flags.mjs kopierer dem dit før dev og build. Vi bruker ikke react-circle-flags,
// fordi den henter bildene fra en ekstern server (blokkert av CSP og avslører brukernes IP).
export function flagUrl(countryCode: string): string {
  return `/flags/${countryCode.toLowerCase()}.svg`;
}
