# Første appoppsett

Opprettet 20.09.2026 etter Max' bestilling: initialiser verktøy og appgrunnlag,
uten produktkode. [Emnekrav](emnekrav.md) T01/T02/T07/T08 styrer verktøyvalget.
Dette er et teknisk oppsettsnotat, ikke studentenes arkitekturbegrunnelse til rapporten.

## Hva som er satt opp

| Del | Valg |
|---|---|
| Starter | Offisiell minimal starter v1.7.3, opprettet med `npx --yes create-rwsdk@3.1.3 app` |
| Kjøring | Node 24.19.0, npm 11.17.0. Samme versjoner i CI; bare én låsefil, `app/package-lock.json` |
| App | RedwoodSDK 1.7.3, React 19.2.8 og Vite 8.2.2. Vite følger Redwood, ingen separat Vite-app |
| Typer | TypeScript 6.0.3, strict. Starterens TypeScript 7 ble erstattet fordi typescript-eslint 8.70 støtter TypeScript under 6.1 |
| Worker | Cloudflare Vite-plugin 1.56.0, Wrangler 4.135.0, lokal workerd-runtime |
| Database | Drizzle ORM 0.45.2, Drizzle Kit 0.31.10, lokal D1-binding `DB` |
| Kvalitet | ESLint, Vitest 5.0.1 med V8-dekning, Playwright 1.63.0 med Chromium |
| CI | Låst installasjon, dokumenter, whitespace, typekontroll, lint, Vitest/dekning, lokal D1, bygg og Playwright |

Pakkeversjonene og integritetshashene ligger i låsefilen. Native installasjonsskript
for esbuild/workerd er eksplisitt tillatt for konkrete versjoner i package.json.
Ved oppdatering må eventuelle nye skriptversjoner vurderes, ikke automatisk tillates.

Appen ligger i `app/` for å bevare kurs- og plandokumentene i repo-roten.
Samme Git-repo dekker alt; ingen ny Git-init eller nested repo. npm installerer
rammeverk og verktøy lokalt i appen, ikke globalt på PC-en. Node/npm må installeres
separat på Emils/skole-PC-en. Se [README](../README.md) for kommandoer.

## Database uten produktmodell

`app/wrangler.jsonc` har en tydelig lokal plassholder-ID og `remote: false`.
`npm run db:check` kjører `SELECT 1` med eksplisitt `--local`; ingen Cloudflare-konto
eller skyressurs trengs. Lokal tilstand under `app/.wrangler/` er Git-ignorert.
Vite-pluginen og Wrangler bruker standard lokal tilstand fra samme appmappe.

`app/src/db/schema.ts` er tom med vilje. Gruppen designer egne tabeller senere.
Drizzle-konfigurasjon og migrasjonskommandoer er klare; null tabeller gir ingen
migrasjoner. Ingen eksempelbrukere, annonser, avtaler, auth-tabeller eller seed er laget.
Det er heller ikke skrevet en datatilgangsmodul før modellen og bruken er avklart.

## Hva kontrollene faktisk beviser

- Tre Vitest-tester prøver eksisterende starter-middleware: sikkerhetsheadere,
  request-nonce og HSTS med/uten utviklingsserver. Dette er scaffold-tester skrevet
  av Codex, ikke studentenes egne L8a-tester eller integrasjon av produktets hovedflyt.
- Playwright kjører mot produksjonsbygget med lokal Cloudflare-runtime. Det sjekker
  HTML/HTTP 200, klienthydrering via starterens kopierknapp, ingen JavaScript-unntak
  og HTTP 404 for ukjent rute.
- D1-kontrollen beviser at lokal runtime kan kjøre SQL. Den beviser ikke Drizzle-spørringer,
  datamodell, migrering av produktdata eller autorisasjon.
- Dekningsrapporten inkluderer starterens kildefiler, uten et kunstig 50 %-krav for
  dette oppsettet. Første kjøring viser 29,16 % linjer. **T07 er ikke oppfylt:** minst én
  reell hovedflytintegrasjon og kursets 50 %-minimum gjenstår når produktkode bygges.

Vitest bruker separat konfigurasjon uten Cloudflare-pluginen for rene enhetstester.
Runtime-integrasjon dekkes foreløpig av browser/SQL-smoke. Ingen testbakdør er lagt i
Worker-rutene. Når serverhandlinger og datamodell finnes, velges reelt integrasjonsoppsett.

## Avgrensninger og kjente funn

- Ingen markedsplassfunksjoner, innlogging, studentverifisering eller design er implementert.
  Starterens velkomstside er beholdt, med byggekommando tilpasset npm/lokal kjøring.
- Ingen skykonto, fjern-D1, deploy, utgivelse eller hemmeligheter er opprettet.
  Starterens automatiske deploy-/miljøopprettingsskript er fjernet. Cloudflare er runtime
  for oppsettet, men produksjonskonto, ressurs-ID-er og publisering må avtales separat.
- Starterens fem høye npm-audit-funn ble fjernet ved å oppdatere Wrangler/Cloudflare-plugin.
  Stabil Drizzle Kit har fortsatt fire moderate audit-funn i samme transitive esbuild-kjede
  (GHSA-67mh-4wv8-2f99). Ikke bruk `npm audit fix --force`, som foreslår eldre Drizzle Kit.
  Drizzle Studio/server er ikke satt opp. Følg opp en kompatibel upstream-fiks; dette er
  ikke en sikkerhetsgodkjenning av applikasjonen.
- PR-beskyttelse er fortsatt avhengig av GitHub-abonnementet. Grønn CI alene blokkerer
  ikke direkte push. Se [CI-veiledningen](ci-og-deploy.md).
- Emil må prøve ren installasjon på sin egen maskin. Ingen studentmestring eller timer
  registreres ut fra at assistenten har kjørt verktøyene.

## Offisielle oppsettskilder

Kontrollert 20.09.2026, sammen med repoets kursgrunnlag:

- [RedwoodSDK quick start](https://docs.rwsdk.com/getting-started/quick-start/)
- [Starter v1.7.3](https://github.com/redwoodjs/sdk/releases/tag/v1.7.3)
- [Lokal D1](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Drizzle og D1](https://orm.drizzle.team/docs/get-started/d1-new), API-idé kontrollert mot installert stabil versjon; ikke automatisk valgt RC fra nettsiden
- [RedwoodSDK og Vitest](https://docs.rwsdk.com/guides/vitest), referanse for senere runtime-integrasjon

Ingen ny full Canvas-revisjon er utført i oppsettsøkten. Kursreglene og særgrensene
for KI i [KI-avtalen](../KI-AVTALE.md) gjelder fortsatt.

## Verifikasjon av oppsettet 20.09.2026

- Ren `npm ci` og hele `npm run check` besto på Windows med Node 24.19.0/npm 11.17.0.
- Drizzle-generering fant null tabeller, og lokal migreringskommando fant ingen migrasjoner.
- `npm run dev` svarte HTTP 200 på localhost. Produksjonsbyggets to Playwright-tester besto.
- Negativ kontroll: endret midlertidig nosniff-headeren til en ugyldig verdi. Riktig Vitest-test
  feilet med returkode 1; gjenopprettet originalen og alle tre testene besto igjen.
- Uavhengig kritiker fant én tabellformateringsfeil i arbeidsloggen; den er rettet.
- Dokumentkontroll og actionlint besto. WAL, avhengigheter, database, bygg og rapporter er ignorert.
- GitHub-Linux-kjøring kontrolleres på oppsetts-PR-en; lokal kontroll er ikke bevis på en CI-kjøring.
