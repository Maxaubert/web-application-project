# CI, PR-regler og videre deploy

Oppdatert 05.10.2026. Dette er den konkrete driftsveiledningen. Den opprinnelige
[GitHub-planen](../arkiv/github-repo-oppsett.md) fra 16.09 er arkivert; åpne punkter følges på Kanban-boardet.

## Hva som finnes nå

| Del | Status |
|---|---|
| CI | Samlet `Repository checks`: dokumenter, whitespace, npm ci, typecheck, lint, Vitest/dekning, lokal D1, bygg og Playwright. Kjører på PR og push mot `main` og `develop`. |
| Node/npm | Node 24.19.0 fra `.node-version`, npm 11.17.0. Samme versjoner lokalt og i CI. |
| Avhengighetsoppdatering | Dependabot for Actions og npm i `/app`, ukentlig, med PR-er mot `develop`. Ingen automatisk merge. |
| PR-beskyttelse | **Aktiv på main og develop** (kontrollert 05.10.2026). Repoet er offentlig. PR, bestått `Repository checks`, oppdatert branch og løste tråder kreves, også for admin. Review er frivillig. |
| Testomfang | Starterens headere, render/hydrering/404 og lokal SQL. Produktets hovedflytintegrasjon og 50 % dekning gjenstår. Ingen skjulte eller tillatte testfeil. |
| Deploy og release | Cloudflare Worker `webapp` med D1 `webapp-db` i skyen (gratisplan, Max' konto, 07.10.2026): https://webapp.web-application-project.workers.dev. Deploy for hånd med `npm run deploy`; ingen automatisk deploy fra GitHub. |

Workflowen bruker GitHub-hostet Linux-runner, lesetilgang til innhold, Actions låst
til verifiserte commit-SHA-er og femten minutters tidsgrense. Ingen deploy-nøkler eller
skrivetoken trengs. Eldre kjøringer av samme PR kanselleres; hovedbranch-kjøringer
kanselleres ikke på denne måten. Påkrevde sjekker må ikke få path-filtre som gjør
at de uteblir. Returkode ved feil skal stoppe jobben, ikke ignoreres.

## PR-beskyttelsen på main

[Ferdig beskyttelseskonfigurasjon](../../.github/branch-protection.json) krever:

- PR før endring av main, også for administratoren.
- Ingen påkrevd godkjenning. Max fjernet kravet om review fra Emil 05.10.2026
  (`required_approving_review_count: 0`). Review er frivillig, men anbefales.
- Løste reviewtråder, oppdatert branch og bestått `Repository checks` fra GitHub Actions.
- Ingen force-push eller sletting av main.

Emil-18 er registrert som samarbeidspartner ved kontroll 20.09.2026.
KI-review erstatter ikke medstudentreview når review gjøres. Admin kan fremdeles endre repoets
innstillinger; regelen er en sperre i arbeidsflyten, ikke umulighet for en eier å endre policy.

Ved endring: kontroller eksisterende regler først og sammenhold dem med filen slik at
nye regler ikke overskriver senere endringer. Deretter, fra repo-roten:

```powershell
gh api --method PUT repos/Maxaubert/web-application-project/branches/main/protection --input .github/branch-protection.json
gh api --method PUT repos/Maxaubert/web-application-project/branches/develop/protection --input .github/branch-protection.json
gh api repos/Maxaubert/web-application-project/branches/main/protection
```

JSON-filen er oppskriften; den aktive regelen ligger i GitHub. Bekreft lagrede verdier
med API-et etter endring. Ikke prøv en direkte push til main med ekte endringer som test.

## Deploy til Cloudflare (07.10.2026)

Satt opp av Max etter KI-kurset leksjon 10, med hans uttrykkelige tillatelse til skyressurser.
Fra `app/`, innlogget med `npx wrangler login`:

```powershell
npm run db:migrate:remote   # migrasjoner til D1 i skyen (webapp-db)
npm run deploy              # bygg og last opp Worker «webapp»
npx wrangler secret put BETTER_AUTH_SECRET   # bare ved ny hemmelighet; lagres kryptert hos Cloudflare
```

- `wrangler.jsonc`: Worker `webapp`, binding `DB` → D1 `webapp-db` (ID er ikke hemmelig). `remote: false`
  betyr at `npm run dev`, tester og CI alltid bruker lokal kopi.
- `.dev.vars` lastes ikke opp. I produksjon er `LOGIN_CODE_DELIVERY` ikke satt, så kodesending feiler
  med vilje til EmailJS er på plass (#46). Innlogging virker derfor ikke på nett ennå.
- Kjør alltid `npm run db:migrate:remote` før `npm run deploy` når en PR har ny migrasjon.

## Appkontroller og videre utvidelse

Fra `app/`: `npm ci`, `npx playwright install chromium`, `npm run check`.
CI bruker `--with-deps` ved browserinstallasjon på Linux. Appkontrollene må kjøres
på alle PR-er, også når dokumenter endres. Installer fra låsefilen, ikke med løs pakkeoppløsning.
Playwright tester produksjonsbygget i lokal Cloudflare-runtime på port 4173.
Vitest-dekning og Playwright-rapporter/traces lagres som CI-artefakter i sju dager.

Gaten kjører i én jobb og stopper ved feil. Ingen test bruker produksjonsdata,
Cloudflare-konto eller hemmeligheter. `npm run generate` bruker bare lokal Wrangler-konfigurasjon.
For konkrete versjoner, opphav og begrensninger, se [appoppsettet](oppsett.md).

Ved produktutvikling: utvid med reelle enhets-/integrasjonstester, hovedflyt-E2E,
syntetiske aktører og minst 50 % dekning etter T07. Bevis at tilgangsfeil ikke endrer
lagret data. Oppsettets tre enhetstester og to browser-smoke-tester oppfyller ikke
kursets produktkrav. Innfør dekningsgate med avtalt målegrunnlag sammen med produktets tester.
Ikke ekskluder vanskelig kode for å få grønt resultat.

Behold sjekknavnet `Repository checks` som samlet gate dersom arbeidet senere deles
opp i jobber. Verifiser at feil eller nødvendige jobber som hoppes over blokkerer gaten.

## Release og deploy for en nettside

Anbefaling: bruk deploy som hovedleveranse når en fungerende app og hosting er valgt.
En GitHub Release publiserer versjonsnotater/artefakter; den ruller ikke automatisk ut
nettsiden. Vi oppretter derfor ikke tomme utgivelser ved hver dokumentendring.

Planlagt flyt: PR → CI og eventuelt isolert preview → menneskelig review → merge →
CI på den sammenslåtte versjonen → godkjent produksjonsdeploy med helsesjekk.
Ingen utrulling skal starte bare fordi en mislykket workflow er avsluttet.

Før aktivering må gruppen velge plattform (ut fra stack), test-/produksjonsmiljø,
tilgangsmodell og kostnadsramme. Avklar secrets/OIDC, én utrulling av gangen,
databasemigrering, backup og rollback. Sjekk abonnementets støtte for miljøgodkjenning.
Workflow for deploy opprettes først når vi kan bygge og prøve den mot valgt plattform.
Merk større milepæler eller innlevering med tag/GitHub Release når det har en konkret nytte.

## Kilder

Kontrollert 19.09.2026: repoets GitHub API-tilstand og offisiell dokumentasjon om
[branch protection og abonnement](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[beskyttelses-API](https://docs.github.com/en/rest/branches/branch-protection),
[sikker bruk av Actions](https://docs.github.com/en/actions/reference/security/secure-use),
[checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) og
[setup-node](https://github.com/actions/setup-node/releases/tag/v7.0.0).
