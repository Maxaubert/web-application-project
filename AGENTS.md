# Prosjektveiledning for kodeassistenter

## Formål og nåtilstand

- ITF31619 Webapplikasjoner 26H ved HiØ. Gruppen er Max og Emil etter brukerens opplysning.
- Optimaliser for en fungerende egen app og begge studentenes eksamensforståelse.
- Foreløpig bare dokumentasjon. Studentmarked med salg, gratis lån og leie er valgt av Max;
  alle tre i MVP, avtaler via forespørsler/motforslag, chat senere. Stack/arkitektur er åpne.
- [Kravspesifikasjon](kravspesifikasjon.md) er gjeldende produktkilde; [teknisk plan](docs/teknisk-plan.md)
  beskriver gjennomføring. Ikke anta Emil-godkjenning eller finn på uavklarte avtalevilkår.
- Les [emnekrav](docs/emnekrav.md), [prosjektkort](docs/prosjekt.md) og [KI-avtale](KI-AVTALE.md)
  før implementering. Les [teknikk](docs/teknikk.md) for berørte kodeområder og
  [læringskart](docs/laering.md) for faglig veiledning. Vanlige lenker er ikke automatisk innlastet.

## Kilder og avvik

- Nyeste relevante Canvas-kunngjøring og gjeldende kursplan styrer krav.
  Årets undervisningsmateriale utdyper; 2025 er historisk støtte. Lokale notater er syntese.
- Bruk stabile krav-ID-er fra emnekrav. Varsle konkret: krav-ID, kilde/punkt eller side,
  observert avvik, konsekvens og minste retting. Skill krav fra anbefaling og teamstandard.
- Ikke kall uavklart dato, ukjent fremdrift eller upublisert øving et bekreftet krav.
- Oppdater kilder ved milepæler. Følg [kilder](docs/kilder.md); ikke hent andre emner eller
  kontodata. Ikke skriv til School, Claude-minner eller andre prosjekter.
- Hvis kodeeksempel kolliderer med sikre API-er, dokumenter konflikten og sjekk offisiell
  dokumentasjon for valgt versjon. Ikke kopier tidlige, ufullstendige demonstrasjoner blindt.

## Faglige føringer

- Hold løsningen meningsfull og avgrenset. Kvitter viser omfang, det er ikke obligatorisk appidé.
- Følg T01–T08: godkjent stack, bevisst server/klient-skille, eget skjema, REST,
  autorisasjon i skrivehandler, reell innlogging, hovedflyt, meningsfull Vitest-dekning.
- RAG, R2, cron og avansert auth er valgfrie utvidelser; prinsippene er eksamensrelevante.
  Reell innlogging og tilgangskontroll er likevel kjernekrav.
- TypeScript erstatter ikke runtime-validering. Klientkontroll og rutebeskyttelse erstatter
  ikke sesjons- og eierskapskontroll inne i handlingen. Autentisering er ikke autorisasjon.
- Tester skal kunne avsløre feil. Bevis både avvisning og uendret lagring ved ulovlig skriving.
  Ikke bytt ekte databaseintegrasjon med stubber som alltid lykkes.
- Følg eksisterende struktur, én tydelig oppgave per fil, og refaktorer ved reelt behov.
  Ingen vilkårlige linjegrenser eller obligatoriske lag for en liten funksjon.
- For UI: store lesbare tekster, god kontrast, store klikkflater, tastatur og høy zoom.
  Bruk relevante designferdigheter før UI-design. Vi bygger ingen UI i dette grunnlaget.

## KI og læring

- KI kan hjelpe med oppsett, kode, forklaring, feilsøking og review innenfor oppgaven.
  Ikke gjør alt til en obligatorisk sokratisk samtale. Utfør autorisert arbeid.
- Les øvingens konkrete KI-policy først. Skriv ikke beskyttet vurderingstekst for studentene:
  egen arkitekturbegrunnelse i rapporten (2026 s. 230), bestemte refleksjonsøvinger og
  retningslinjedokumentet (s. 213). L8a krever første versjon av minst to tester uten KI (s. 201).
  Dette er kontekstspesifikke regler, ikke et generelt forbud mot KI-generert kode.
- Tilby begrepsforklaring, kilder, nøytrale spørsmål og øving for slike oppgaver, uten å
  skrive selve resonnementet eller fasiten. Ikke skriv studentens første testversjoner.
- Ikke hjelp med live-svar under vurdering uten hjelpemidler. Forberedelse er tillatt.
- Etter vesentlig kodeendring: forklar dataflyt og avveining kort, pek på relevante
  eksamenstemaer og tilby én liten forklarings-/endringsoppgave for hver student.
- Marker hull som «ikke prøvd» eller «trenger øving». Lesing og KI-forklaring beviser ikke mestring.
- Loggfør faktiske KI-bidrag og verifikasjon. Ikke dikt bidrag, timer, møter, refleksjon,
  signaturer, git-forfattere eller læringsresultater. Ingen ferdigutfylte studentbesvarelser.
- Etter hver meningsfull økt: oppdater [TODO](TODO.md) og [felles arbeidslogg](arbeidslogg-max-og-emil.md).
  Før [timer](timeliste.md) bare fra studentenes opplysninger; ukjent er ikke null.
  TODO er aktiv backlog frem til Issues/Kanban overtar. Bevar historikk og lenk til utført arbeid.

## Git, personvern og samarbeid

- Alle repoendringer på branch og i PR, også docs. Ingen push til hovedbranch.
- Funksjonsendring: issue først, så branch, så PR. Lokalt uten remote: beskriv oppgaven og
  PR-utkastet i [review](docs/review.md); opprett faktisk issue/PR først når remote er godkjent.
- Ikke opprett remote, publiser, deploy eller send meldinger til faglærer uten eksplisitt fullmakt.
- Stopp før merge. Bare Oves eksplisitte godkjenning av den identifiserte PR-en gjelder.
- Ikke opprett skyressurser eller kopier School/OS-arkiver, hemmeligheter og andre studenters data.
- Hver student committer egne faktiske bidrag løpende. KI-arbeid skal være synlig, ikke tilskrives
  Max eller Emil som selvstendig læringsarbeid. Ikke omskriv historikk for å simulere deltakelse.
- Unngå å squash'e bort andre studenters sporbare bidrag uten å bevare ekte forfattere og
  originalhistorikk til innleveringen. Se [samarbeid](docs/samarbeid.md).
- Norsk i dokumentasjon og leveranser. Ingen em dash. Bevar studentens ordlyd ved korrektur.

## Kjøring og verifikasjon

- Nå: `node scripts/verify-docs.mjs` og `git diff --check`. CI kjører også disse kontrollene
  med Node 22.x. Se [CI og beskyttelsesstatus](docs/ci-og-deploy.md); PR-kravet er ennå ikke teknisk håndhevet.
- Når appens package.json legges til: erstatt CI-sperren med reell install/lint/typecheck/test/build
  i samme PR. Ikke fjern sperren og la dokumentkontroll være eneste appgate.
- Appens install/run/build/typecheck/lint/test/E2E-kommandoer er TBD; finn ikke på resultater.
- Første appoppsett skal gi dokumenterte, faktisk prøvde kommandoer, CI med typecheck/lint/unit,
  og lokal Playwright E2E når UI finnes. Ingen «grønn CI» fra dokumentkontroll alene.
- Kode-PR: kjør full enhetssuite, typekontroll og lint, samt relevant integrasjon/dekning og
  lokal Playwright ved UI-endring. Test hovedflyten fra README på branch-bygget før mergeforslag.
- Ikke deploy til Vercel automatisk: kursets stackvalg avgjør plattform, og publisering krever fullmakt.
- Rapporter hva som er endret, hva som faktisk er kjørt, feil og gjenstående usikkerhet.
- Hold AGENTS.md og CLAUDE.md under ca. 200 linjer; detaljer skal bo i lenkede fagfiler.
