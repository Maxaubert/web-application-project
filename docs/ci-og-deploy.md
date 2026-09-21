# CI, PR-regler og videre deploy

Oppdatert 20.09.2026, bestilt av Max. Dette er den konkrete driftsveiledningen;
[GitHub-planen](github-repo-oppsett.md) beholder den større sjekklisten.

## Hva som finnes nå

| Del | Status |
|---|---|
| CI | Samlet `Repository checks`: dokumenter, whitespace, npm ci, typecheck, lint, Vitest/dekning, lokal D1, bygg og Playwright. Appkontrollene ligger på oppsettsbranchen frem til merge. |
| Node/npm | Node 24.19.0 fra `.node-version`, npm 11.17.0. Samme versjoner lokalt og i CI. |
| Avhengighetsoppdatering | Dependabot for Actions og npm i `/app`, ukentlig. Ingen automatisk merge. |
| PR-beskyttelse | **Blokkert av GitHub-abonnementet.** Sist prøvd 19.09: private repo krever Pro eller offentlig repo. Repoet beholdes privat; direkte push er ikke teknisk sperret. |
| Testomfang | Starterens headere, render/hydrering/404 og lokal SQL. Produktets hovedflytintegrasjon og 50 % dekning gjenstår. Ingen skjulte eller tillatte testfeil. |
| Deploy og release | Ingen hosting, hemmeligheter, deploy eller automatisk GitHub-utgivelse konfigurert. |

Workflowen bruker GitHub-hostet Linux-runner, lesetilgang til innhold, Actions låst
til verifiserte commit-SHA-er og femten minutters tidsgrense. Ingen deploy-nøkler eller
skrivetoken trengs. Eldre kjøringer av samme PR kanselleres; hovedbranch-kjøringer
kanselleres ikke på denne måten. Påkrevde sjekker må ikke få path-filtre som gjør
at de uteblir. Returkode ved feil skal stoppe jobben, ikke ignoreres.

## Slå på PR-beskyttelsen når GitHub tillater det

[Ferdig beskyttelseskonfigurasjon](../.github/branch-protection.json) krever:

- PR før endring av main, også for administratoren.
- Én godkjenning fra en annen godkjenner enn den som gjorde siste push. Gamle
  godkjenninger fjernes når nye endringer krever review.
- Løste reviewtråder, oppdatert branch og bestått `Repository checks` fra GitHub Actions.
- Ingen force-push eller sletting av main.

Emil-18 er registrert som samarbeidspartner ved kontroll 20.09.2026.
KI-review erstatter ikke medstudentreview. Admin kan fremdeles endre repoets
innstillinger; regelen er en sperre i arbeidsflyten, ikke umulighet for en eier å endre policy.

Når abonnementet støtter dette, kontroller eksisterende regler først og sammenhold
dem med filen slik at nye regler ikke overskriver senere endringer. Deretter, fra repo-roten:

```powershell
gh api --method PUT repos/Maxaubert/web-application-project/branches/main/protection --input .github/branch-protection.json
gh api repos/Maxaubert/web-application-project/branches/main/protection
```

JSON-filen er en oppskrift, ikke aktiv GitHub-beskyttelse. Bekreft lagrede verdier
med API-et og at en PR uten review eller bestått sjekk faktisk vises som blokkert.
Dokumenter en kontrollert feilsjekk før dere kaller merge-gaten verifisert. Ikke prøv
en direkte push til main med ekte endringer som test. Ikke gjør repoet offentlig
eller kjøp abonnement uten eksplisitt bestilling.

## Appkontroller og videre utvidelse

Fra `app/`: `npm ci`, `npx playwright install chromium`, `npm run check`.
CI bruker `--with-deps` ved browserinstallasjon på Linux. Appkontrollene må kjøres
på alle PR-er, også når dokumenter endres. Installer fra låsefilen, ikke med løs pakkeoppløsning.
Playwright tester produksjonsbygget i lokal Cloudflare-runtime på port 4173.
Vitest-dekning og Playwright-rapporter/traces lagres som CI-artefakter i sju dager.

Gaten kjører i én jobb og stopper ved feil. Ingen test bruker produksjonsdata,
Cloudflare-konto eller hemmeligheter. `npm run generate` bruker bare lokal Wrangler-konfigurasjon.
For konkrete versjoner, opphav og begrensninger, se [appoppsettet](app-oppsett.md).

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
