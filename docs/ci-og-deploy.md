# CI, PR-regler og videre deploy

Oppsett 19.09.2026, bestilt av Max. Dette er den konkrete driftsveiledningen;
[GitHub-planen](github-repo-oppsett.md) beholder den større sjekklisten.

## Hva som finnes nå

| Del | Status |
|---|---|
| CI | [Workflow](../.github/workflows/ci.yml) er prøvd med bestått GitHub-kjøring på PR. Den kontrollerer dokumenter og whitespace. Push til main og manuell start blir tilgjengelig etter merge. Bevis står i PR og verifikasjonsloggen. |
| Node | CI bruker 22.x fra [.node-version](../.node-version); siste tilgjengelige patch innen den serien. Ingen pakkeinstallasjon trengs ennå. |
| Avhengighetsoppdatering | [Dependabot](../.github/dependabot.yml) er konfigurert for ukentlige Actions-oppdateringer. Konfigurasjonen tas i bruk når den ligger på main. Ingen automatisk merge. |
| PR-beskyttelse | **Blokkert av GitHub-abonnementet.** API-et avviser beskyttelse for dette private repoet med beskjed om Pro eller offentlig repo. Repoet beholdes privat; direkte push er derfor ikke teknisk sperret ennå. |
| App-CI | Ikke implementert: app, pakkevalg og kommandoer finnes ikke. CI feiler bevisst hvis package.json legges til uten at appkontrollene samtidig etableres. |
| Deploy og release | Ingen hosting, hemmeligheter, deploy eller automatisk GitHub-utgivelse konfigurert. |

Workflowen bruker GitHub-hostet Linux-runner, lesetilgang til innhold, Actions låst
til verifiserte commit-SHA-er og ti minutters tidsgrense. Ingen deploy-nøkler eller
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

Emil-18 var fortsatt invitert, men ikke aktiv samarbeidspartner ved kontroll
19.09.2026. Han må akseptere invitasjonen for å kunne gi påkrevd review med skrivetilgang.
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

## Første app-PR: utvid samme kvalitetsport

Bytt ut scaffold-sperren i CI med disse reelle stegene i samme PR som appen kommer:

1. Velg Node-/pakkebehandlerversjon for stacken, commit låsefilen og prøv ren,
   låst installasjon lokalt og i CI. Velg kommandoer etter faktisk npm/pnpm-oppsett.
2. Kjør typekontroll, lint, enhetstester, Vitest-integrasjon/dekning og produksjonsbygg.
   Følg T07 for minst én integrasjonstest av hovedflyten og minst 50 % dekning.
3. Kjør Playwright når UI finnes, med isolert testdatabase og syntetiske brukere.
   Ingen produksjonsdatabase eller hemmeligheter fra andre studenter i testene.
4. Last opp relevante feilrapporter/traces med kort lagringstid, uten private data.
5. Behold sjekknavnet `Repository checks` som samlet gate dersom arbeidet splittes
   i jobber; kontroller at alle nødvendige jobber faktisk lykkes, også ved feil/skip.
6. Prøv en bevisst testfeil på arbeidsbranch, se at CI feiler, rett den og kjør på nytt.
   Oppdater README med prøvde kommandoer, TODO og arbeidslogg.

Grønn dokumentkontroll er aldri bevis på at appen fungerer. Dette dokumentet velger
ikke appens arkitektur eller skriver studentenes egen arkitekturbegrunnelse.

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
