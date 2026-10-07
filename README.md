# Webapplikasjonsprosjekt · ITF31619 26H

Arbeidsgrunnlag for **Max og Emil**, Høgskolen i Østfold, høsten 2026.
Målet er å bygge en egen fullstack-app og forstå hele løsningen godt nok til å
forklare, vurdere og endre den uten KI på individuell muntlig vurdering.

**Status 05.10.2026:** prosjektet er et studentmarked med kjøp/salg, gratis lån og
betalt utleie fra første versjon. Forespørsler og motforslag håndterer avtalene;
eieren alene bekrefter retur og fullfører lån/leie. Chat kommer etter MVP.
RedwoodSDK, TypeScript, lokal D1/Drizzle, Tailwind og testverktøy er satt opp i `app/`, med
innlogging med engangskode på e-post og en enkel prisberegning. Ingen markedsplassfunksjoner er implementert.
Se [oppsettsnotatet](docs/app/oppsett.md). Dokumentasjonen er laget med KI (Codex og
Claude Code) etter våre valg og er ikke dokumentasjon på studentenes læring.

## Hent prosjektet

```powershell
gh repo clone Maxaubert/web-application-project
```

Har du allerede klonet prosjektet, bevar eventuelle lokale endringer, bytt til `main`
og hent med `git pull --ff-only`. Ikke overskriv eget eller Emils arbeid ved synkronisering.
Ingen nøkler eller installerte programmer overføres via Git. Installer avhengighetene fra
låsefilen som beskrevet nedenfor.

## Dokumentasjon

All dokumentasjon ligger i [`docs/`](docs/README.md), sortert i mapper:

| Mappe | Hva den svarer på |
|---|---|
| [Krav](docs/krav/kravspesifikasjon.md) | Hva appen skal gjøre: MVP, regler, funksjonelle krav og [akseptansekriterier](docs/krav/akseptansekriterier.md) |
| [App](docs/app/teknisk-plan.md) | Teknisk plan, kodekvalitet, appoppsett, CI og dokumentkontroll |
| [Design](docs/design/wireframes/README.md) | Wireframes og skjermspesifikasjon |
| [Prosess](docs/prosess/ki-avtale.md) | KI-avtale, samarbeid og Git, arbeidslogg og timeliste |
| [Emne](docs/emne/emnekrav.md) | Emnekrav, kilder, lærerens KI-mal og læringskart |
| [Leveranser](docs/leveranser/README.md) | Sluttrapport, sign-off og leveransekontroll |
| [Arkiv](docs/arkiv/README.md) | Historiske planer som ikke vedlikeholdes |

**[Kanban-boardet](https://github.com/users/Maxaubert/projects/1)** har oppgavene som GitHub Issues.
[Endringsloggen](docs/endringslogg.md) viser vesentlige endringer over tid.

## Kjør kontroll av dokumentasjonen

Fra denne repo-roten, med Node.js 24.19.0 (CI bruker samme versjon fra `.node-version`):

```powershell
node scripts/verify-docs.mjs
git diff --check
```

Ingen pakkeinstallasjon kreves. Kontrollen sjekker lokale lenker, noen kritiske
veiledningspunkter, filstruktur og en begrenset personvernkontroll. Den vurderer
ikke studentenes forståelse eller om emnet er bestått. Se [begrensningene](docs/app/dokumentkontroll.md).

## Installer og kjør appgrunnlaget

Bruk Node **24.19.0** og npm **11.17.0**. Fra repo-roten:

```powershell
cd app
npm ci
npx playwright install chromium
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Åpne adressen Vite viser, normalt `http://127.0.0.1:5173`, og logg inn med en `@hiof.no`-adresse.
Lokalt sendes ingen e-post: **innloggingskoden skrives i terminalen** der `npm run dev` kjører,
og i nettleserens utviklerkonsoll (F12, Console) på kodesiden.
Første `npm run dev` lager `app/.dev.vars` med en tilfeldig lokal hemmelighet (Git-ignorert).
Ingen Cloudflare-innlogging trengs lokalt.
Stopp med Ctrl+C. Alle kommandoer nedenfor kjøres fra `app/`:

| Oppgave | Kommando |
|---|---|
| Hele lokale kontrollrekken | `npm run check` |
| Generer bindingstyper og kontroller TypeScript | `npm run typecheck` |
| Lint | `npm run lint` |
| Vitest / dekning | `npm test` / `npm run test:coverage` |
| Produksjonsbygg | `npm run build` |
| Test produksjonsbygget i Chromium | `npm run test:e2e` (bygg først) |
| Lokal forhåndsvisning av bygget | `npm run preview` |
| Prøv lokal D1 | `npm run db:check` |
| Generer migrasjon fra eget skjema | `npm run db:generate` |
| Kjør migrasjoner lokalt | `npm run db:migrate:local` |
| Legg inn testannonser lokalt (aldri i skyen) | `npm run db:seed:local` |

Migrasjonene ligger i `app/drizzle/`: `0000_auth.sql` har innloggingstabellene, `0001_listing.sql` annonsetabellen.
Testdataene (`app/scripts/seed-local.sql`) er en testbruker og seks annonser, én per tilfelle kortet må vise.
Playwright starter og stopper sin egen preview på port 4173; porten må være ledig.
På Linux installeres browseravhengighetene med `npx playwright install --with-deps chromium`.
CI utfører installasjon og hele kontrollrekken. Startertester er ikke bevis på at
hovedflyten, auth eller kursets dekningskrav er oppfylt. Se [begrensninger og kjente
avhengighetsfunn](docs/app/oppsett.md). Deploy/release er ikke konfigurert.

## Appen på nett

https://studentmarkedet.org (Cloudflare, oppdateres for hånd med `npm run deploy`).
Koden sendes på e-post fra `noreply@mail.studentmarkedet.org` (Resend). Se [CI og deploy](docs/app/ci-og-deploy.md).

## Publisering og rettigheter

Repoet er offentlig på GitHub. Alle endringer gjøres på branch og gjennom PR. GitHub
krever PR og grønn `Repository checks` før merge til main; review er frivillig. Se
[CI og PR-regler](docs/app/ci-og-deploy.md). Ingen merge uten Max' godkjenning av den konkrete PR-en.

Ikke legg inn Canvas-token, rå kursarkiv, persondata om andre studenter eller interne
bedriftsdokumenter. Lisensvalg står åpent; dette grunnlaget gir ingen lisens til
å republisere lærerens materiale. [Kildeindeksen](docs/emne/kilder.md) peker til det som er lest.
