# Webapplikasjonsprosjekt · ITF31619 26H

Arbeidsgrunnlag for **Max og Emil**, Høgskolen i Østfold, høsten 2026.
Målet er å bygge en egen fullstack-app og forstå hele løsningen godt nok til å
forklare, vurdere og endre den uten KI på individuell muntlig vurdering.

**Status 19.09.2026:** prosjektet er et studentmarked med kjøp/salg, gratis lån og
betalt utleie fra første versjon. Forespørsler og motforslag håndterer avtalene;
eieren alene bekrefter retur og fullfører lån/leie. Chat kommer etter MVP.
Ingen app er implementert, og endelig stack er ikke valgt.
Dokumentasjonen er laget med Codex og er ikke dokumentasjon på studentenes læring.

## Hent prosjektet på en annen PC

Repoet er privat på GitHub. Etter at dokumentasjons-PR-en er merget, bruk `main`:

```powershell
gh repo clone Maxaubert/web-application-project -- --branch main
```

Har du allerede klonet prosjektet, bevar eventuelle lokale endringer, bytt til `main`
og hent med `git pull --ff-only`. Ikke overskriv eget eller Emils arbeid ved synkronisering.
Eldre daterte loggnotater om manglende remote beskriver situasjonen da de ble skrevet.
School har en separat PR; dens arbeidsbranch er fortsatt `codex/skole-pc-sync`.
Skole-PC-en trenger egne installasjoner og eventuell separat Canvas-tilgang. Ingen nøkler
eller installerte programmer overføres via Git. Det finnes fortsatt ingen implementert app.

## Start her

| Dokument | Hva det svarer på |
|---|---|
| [Kravspesifikasjon](kravspesifikasjon.md) | Hva appen skal gjøre: MVP, regler, funksjonelle krav, kvalitet, design og akseptansekriterier |
| [Teknisk plan](docs/teknisk-plan.md) | Hvordan kravene skal realiseres; åpne teknologivalg, datamodell, API, innlogging og tester |
| [Lærerens KI-avtale](docs/ki-avtale-canvas.md) og [gruppens arbeidsutkast](KI-AVTALE.md) | Canvas-teksten om KI-bruk, skilt fra avtalen Max og Emil må gjennomgå og bekrefte |
| [CI, PR-regler og deploy](docs/ci-og-deploy.md) | Workflowen som finnes, blokkert branch protection og hva som må på plass ved appoppsett |
| Denne README-en | Prosjektoversikt, dokumentkart og kjøreoppskrift når appen finnes |

**[To-do: dokumentene vi skal skrive](TODO.md)** samler MVP, kravspekk,
akseptansekriterier, prioritering og resten av planleggingen, med utført arbeid og neste steg.
[Felles arbeidslogg](arbeidslogg-max-og-emil.md) følger fremdriften, og [timelisten](timeliste.md)
samler Max og Emils faktiske timer. TODO vedlikeholdes frem til Issues og Kanban overtar.

1. Les [krav og åpne frister](docs/emnekrav.md). Sign off er 29.09.2026 kl. 12–14 norsk tid.
2. Gjennomgå [kravspesifikasjonen](kravspesifikasjon.md) og [teknisk plan](docs/teknisk-plan.md) sammen. Bruk [prosjektkortet](docs/prosjekt.md) til arbeidsdeling og fremdrift.
3. Avtal [samarbeid](docs/samarbeid.md) og [KI-bruk](KI-AVTALE.md). Avtalene er foreløpig utkast.
4. Velg stack innenfor emnets rammer, og opprett den første lille appflyten med
   [teknisk sjekkliste](docs/teknikk.md). Start ikke med alle mulige funksjoner.
5. Bruk [læringskartet](docs/laering.md) underveis og [leveransekontrollen](docs/leveranse.md) før fremvisning.

## Prosjektkart

| Når dere trenger | Les |
|---|---|
| Gjeldende emnekrav, kilder, evidens | [Emnekrav](docs/emnekrav.md), [kildeindeks](docs/kilder.md) |
| Produkt, omfang og gjennomføring | [Kravspesifikasjon](kravspesifikasjon.md), [teknisk plan](docs/teknisk-plan.md), [prosjektkort](docs/prosjekt.md) |
| Historiske idéforslag | [Ideer til diskusjon med Emil](docs/ideer-til-diskusjon.md) |
| Før byggestart: avklaringer, prioritering og oppgaver | [Før-bygg-listen](docs/for-bygg-start.md) |
| Planlagt GitHub-oppsett, CI/CD, tester og presentasjon | [GitHub repo-oppsett](docs/github-repo-oppsett.md) |
| Arkitektur, HTTP, database, sikkerhet, tester | [Teknikk og beslutningsmal](docs/teknikk.md) |
| Arbeidsdeling, fremdrift og timer | [Samarbeid](docs/samarbeid.md), [felles arbeidslogg](arbeidslogg-max-og-emil.md), [timeliste](timeliste.md), [loggveiledning](docs/arbeidslogg.md) |
| KI-grenser og hjelp fra Claude/Codex/ChatGPT | [KI-avtale](KI-AVTALE.md), [assistentbruk](docs/assistentbruk.md), [AGENTS.md](AGENTS.md) |
| Egen forståelse, retrospekt og eksamen | [Læringskart](docs/laering.md) |
| Lyntale, sign off, rapport og presentasjon | [Leveranser](docs/leveranse.md) |
| Kontroll av dette grunnlaget | [Lokal review](docs/review.md), [verifikasjon](docs/verifikasjon.md) |

## Kjør kontroll av dokumentasjonen

Fra denne repo-roten, med Node.js 22 eller nyere (CI bruker 22.x fra `.node-version`):

```powershell
node scripts/verify-docs.mjs
git diff --check
```

Ingen pakkeinstallasjon kreves. Kontrollen sjekker lokale lenker, noen kritiske
veiledningspunkter, filstruktur og en begrenset personvernkontroll. Den vurderer
ikke studentenes forståelse eller om emnet er bestått. Se [begrensningene](docs/verifikasjon.md).

## Appkommandoer

| Oppgave | Status |
|---|---|
| Installere, starte, bygge, typekontroll, lint | TBD: fylles med faktisk prøvde kommandoer når stack er valgt |
| Vitest, integrasjon, dekning | TBD: ingen apptester finnes ennå |
| Database, migrasjoner og seed | TBD: eget skjema er ikke valgt |
| Playwright E2E | TBD: legges til når UI finnes |
| CI | GitHub Actions-workflow i denne PR-en: dokument- og whitespace-kontroll; apptester kommer med appen |
| Deploy og release | Ikke aktivert; hosting og utrulling velges med appen. Ingen automatisk utgivelse ved dokumentendringer |

Første app-PR skal erstatte TBD-radene med en reproduserbar oppskrift, nødvendige
miljøvariabelnavn uten verdier, databaseoppsett og testkommandoer. Test på begge
studentenes maskiner. Ikke kopier en maskintest eller demo og kall den studentarbeid.

## Publisering og rettigheter

Repoet er privat på GitHub etter uttrykkelig bestilling. Offentlig GitHub-repo er et
**senere innleveringskrav**, ikke en godkjenning til å endre synlighet nå.
Alle endringer gjøres på branch og gjennom PR; lokal PR-tekst finnes i
[review-fila](docs/review.md). Ingen merge uten Oves godkjenning av den konkrete PR-en.
GitHub håndhever ennå ikke PR-kravet: beskyttelsen for dette private repoet avvises
på gjeldende abonnement. [Beskyttelsesoppsettet](docs/ci-og-deploy.md) er klart til
aktivering når kontoen støtter det. En grønn workflow alene hindrer ikke direkte push.

Ikke legg inn Canvas-token, rå kursarkiv, persondata om andre studenter eller interne
bedriftsdokumenter. Lisensvalg står åpent; dette grunnlaget gir ingen lisens til
å republisere lærerens materiale. [Kildeindeksen](docs/kilder.md) peker til det som er lest.
