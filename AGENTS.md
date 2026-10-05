# Prosjektveiledning for kodeassistenter

## Formål og nåtilstand

- ITF31619 Webapplikasjoner 26H ved HiØ. Gruppen er Max og Emil etter brukerens opplysning.
- Optimaliser for en fungerende egen app og begge studentenes eksamensforståelse.
- Appgrunnlag i `app/` med innlogging med engangskode (#47) og enkel prisberegning; markedsplassfunksjonene er ikke bygget. Studentmarked med salg, lån og gis bort
  (Max 29.09); bud eller låneperiode med motforslag, chat senere. RedwoodSDK/React/TypeScript og Drizzle/D1 er satt opp.
- [Kravspesifikasjon](docs/krav/kravspesifikasjon.md) er gjeldende produktkilde; [teknisk plan](docs/app/teknisk-plan.md)
  beskriver gjennomføring. Ikke anta Emil-godkjenning eller finn på uavklarte avtalevilkår.
- [Wireframes og skjermspesifikasjon](docs/design/wireframes/README.md) er byggegrunnlaget for skjermer, ruter,
  datamodell og API. Den og kravspesifikasjonen skal si det samme; finner du avvik, stopp og spør.
- [Dokumentkartet](docs/README.md) viser hvor alt ligger. Les [emnekrav](docs/emne/emnekrav.md) og
  [KI-avtale](docs/prosess/ki-avtale.md) før implementering. Les [teknikk](docs/app/teknikk.md) for berørte kodeområder og
  [læringskart](docs/emne/laering.md) for faglig veiledning. Vanlige lenker er ikke automatisk innlastet.

## Arbeidsmåte: forsiktig og stegvis (Max 05.10)

- Én ting om gangen: ett issue, én branch, én liten PR. Utvid aldri omfanget uten å spørre.
- Plan først: alt utover en triviell retting starter med en kort plan (hva, hvilke filer,
  hvordan det testes). Ingen kode før Max eller Emil har sagt ja til planen.
- Studentene bestemmer: legg frem alternativer med avveininger og en anbefaling, og forklar
  hvorfor. Studenten velger og skal kunne forsvare valget (studentassistent, sign-off uke 40).
- Vær en kritisk sparringspartner: si imot når et forslag er svakt, nevn svakheter og kostnader,
  og legg frem det sterkeste argumentet for alternativet. Si deg enig bare når begrunnelsen holder.
  «Best practice», «moderne» eller «skalerbart» uten konkret behov er ikke en begrunnelse.
- Les før du skriver: les berørte filer og dokumenter først. Sjekk offisiell dokumentasjon
  for versjonen vi bruker i stedet for å gjette API-er.
- Verifiser før «ferdig»: kjør gatene og rapporter faktisk utfall, også feil.
- Stopp og spør ved tvil, motstrid mellom dokumenter eller uventet tilstand
  (skitten arbeidskatalog, ukjent branch, røde tester du ikke forårsaket).

## Dokumentasjonen holdes konsistent

- Ferdig betyr: samme PR oppdaterer alle berørte dokumenter (krav, akseptansekriterier,
  wireframes, teknisk plan, README, AGENTS) og [endringsloggen](docs/endringslogg.md).
- Én kilde per tema: krav i kravspesifikasjonen, kriterier i akseptansekriteriene, skjermer i
  wireframes, arkitektur i teknisk plan. Lenk i stedet for å kopiere. Endres en beslutning,
  oppdater kilden og fjern motstridende tekst andre steder i samme PR.
- Statuslinjer dateres og rettes så snart de blir feil. Utdaterte dokumenter flyttes til
  `docs/arkiv/` med en linje i arkivoversikten. Nye filer plasseres etter
  [dokumentkartet](docs/README.md), og kartet oppdateres.

## Kilder og avvik

- Nyeste relevante Canvas-kunngjøring og gjeldende kursplan styrer krav.
  Årets undervisningsmateriale utdyper; 2025 er historisk støtte. Lokale notater er syntese.
- Bruk stabile krav-ID-er fra emnekrav. Varsle konkret: krav-ID, kilde/punkt eller side,
  observert avvik, konsekvens og minste retting. Skill krav fra anbefaling og teamstandard.
- Ikke kall uavklart dato, ukjent fremdrift eller upublisert øving et bekreftet krav.
- Søsterrepoet School (privat, `../School`, github.com/Maxaubert/School) er viktigste lokale
  kilde for ferske Canvas-uttrekk, kunngjøringer, sign-off, kursmateriell og Max' beslutningsnotat
  `School/kravdiskusjon.md`. Før krav-, plan-, sign-off-, leveranse- og reviewarbeid: kjør `git pull`
  i School og start i `School/ITF31619-Webapplikasjoner/README.md`. Oppgi School-fil og dato som
  kilde. Bare lesing; mangler det (f.eks. hos Emil), bruk Canvas direkte.
- Lærerens Fullstækk-kurs ligger i `School/ITF31619-Webapplikasjoner/fullstaekk/`; følg oppslagsrutinen
  i `fullstaekk/CLAUDE.md`. Kursmateriellet kopieres aldri inn i dette offentlige repoet; vis til leksjon.
- Oppdater kilder ved milepæler. Følg [kilder](docs/emne/kilder.md); ikke hent andre emner eller
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
- Review følger [review-sjekklisten](docs/prosess/review-sjekkliste.md) (i Claude Code: `/prosjektreview`).
- Review og kodeforslag sjekkes mot Fullstækk-kursene (hva læreren faktisk viser og forventer)
  og mot anerkjent praksis i offisiell dokumentasjon. Oppgi leksjon eller kilde; ved avvik mellom
  kurs og praksis, vis begge og la studentene velge.
- Følg eksisterende struktur, én tydelig oppgave per fil, og refaktorer ved reelt behov.
  Ingen vilkårlige linjegrenser eller obligatoriske lag for en liten funksjon.
- For UI: store lesbare tekster, god kontrast, store klikkflater, tastatur og høy zoom.
  Bruk relevante designferdigheter før UI-design.

## KI og læring

- KI kan hjelpe med oppsett, kode, forklaring, feilsøking og review innenfor oppgaven.
  Ikke gjør alt til en obligatorisk sokratisk samtale. Utfør autorisert arbeid.
- Les øvingens konkrete KI-policy først. Skriv ikke beskyttet vurderingstekst for studentene:
  egen arkitekturbegrunnelse i rapporten (2026 s. 230), bestemte refleksjonsøvinger og
  retningslinjedokumentet (s. 213).
  Dette er kontekstspesifikke regler, ikke et generelt forbud mot KI-generert kode.
- Tilby begrepsforklaring, kilder, nøytrale spørsmål og øving for slike oppgaver, uten å
  skrive selve resonnementet eller fasiten. Beskriv hver test og få Max' godkjenning før den skrives.
- Ikke hjelp med live-svar under vurdering uten hjelpemidler. Forberedelse er tillatt.
- Etter vesentlig kodeendring: forklar dataflyt og avveining kort, pek på relevante
  eksamenstemaer og tilby én liten forklarings-/endringsoppgave for hver student.
- Marker hull som «ikke prøvd» eller «trenger øving». Lesing og KI-forklaring beviser ikke mestring.
- Loggfør faktiske KI-bidrag og verifikasjon. Ikke dikt bidrag, timer, møter, refleksjon,
  signaturer, git-forfattere eller læringsresultater. Ingen ferdigutfylte studentbesvarelser.
- Etter hver meningsfull økt: oppdater [felles arbeidslogg](docs/prosess/arbeidslogg-max-og-emil.md). Før vesentlige
  endringer (funksjon, struktur, krav, beslutning) inn i [endringsloggen](docs/endringslogg.md) samme dag. Oppgaver styres
  som GitHub Issues på [Kanban-boardet](https://github.com/users/Maxaubert/projects/1). Bevar historikk og lenk til utført arbeid.
- **WAL (Max 29.09):** før alltid en løpende, tidsstemplet arbeidslogg hver arbeidsdag i
  `wal/wal-<ÅÅÅÅ-MM-DD>.md` (Git-ignorert, lokal). Opprett dagens fil hvis den mangler. Skriv en rad
  `| Tid | Hva |` når noe faktisk skjer, ikke i etterkant. Hent klokkeslett med `date "+%H:%M"`;
  gjett aldri. Etterførte rader merkes `~` (omtrentlig). Blindveier og forkastede spor skal stå der.
  Aldri hemmeligheter. Ikke force-add WAL eller kopier rånotatene inn i PR-er. Se [loggrutinen](docs/prosess/loggrutine.md).
- Ved dagens slutt: destiller WAL til [arbeidsloggen](docs/prosess/arbeidslogg-max-og-emil.md) (én oppføring per dag, jeg-form som OS-praksisloggen, bare utført arbeid)
  og [timelisten](docs/prosess/timeliste.md) (én rad per dag med kort punkt om hva som ble gjort). Timer kan
  foreslås som anslag fra WAL og commits, merket «anslag», og gjelder først når Max har godkjent dem.
  Ukjent tid er ikke null.

## Git, personvern og samarbeid

- Alle repoendringer på branch, også docs. Ingen push til hovedbranch.
- Opprett aldri PR og merge aldri uten Max' godkjenning. Spør gjerne om det skal gjøres,
  men gjør det aldri automatisk (Max 29.09).
- Navngi branch `type/issue-slug`, eksempelvis `feat/12-innlogging`; ikke bruk codex/ai-prefiks.
- Funksjonsendring: issue først, så branch, så PR når Max ber om det.
- Ikke opprett remote, publiser, deploy eller send meldinger til faglærer uten eksplisitt fullmakt.
- Stopp før merge. Bare Max' eksplisitte godkjenning av den identifiserte PR-en gjelder.
- Ikke opprett skyressurser eller kopier School/OS-arkiver, hemmeligheter og andre studenters data.
- Hver student committer egne faktiske bidrag løpende. KI-arbeid skal være synlig, ikke tilskrives
  Max eller Emil som selvstendig læringsarbeid. Ikke omskriv historikk for å simulere deltakelse.
- Unngå å squash'e bort andre studenters sporbare bidrag uten å bevare ekte forfattere og
  originalhistorikk til innleveringen. Se [samarbeid](docs/prosess/samarbeid.md).
- Norsk i dokumentasjon og leveranser. Ingen em dash. Bevar studentens ordlyd ved korrektur.

## Kjøring og verifikasjon

- Node 24.19.0 og npm 11.17.0. Fra `app/`: `npm ci`, deretter `npx playwright install chromium`.
- Typecheck/lint: `npm run typecheck` og `npm run lint` i `app/`.
- Unit/dekning: `npm run test:coverage`. Testene skal kunne feile; prøv å bryte koden og se at testen blir rød.
- Build: `npm run build`. Artefakt: `app/dist/`, Git-ignorert.
- E2E headless: `npm run test:e2e` etter bygg; ved endring i src, runtime eller appkonfigurasjon.
- Hele appgaten: `npm run check`. CI kjører samme gate og låst installasjon på Linux.
- Dokumenter fra repo-roten: `node scripts/verify-docs.mjs` og `git diff --check`.
- Lokal install/start etter merge: `npm ci` og `npm run dev` i app/. Versjon i `app/package.json`.
- Kjente testfeil som tolereres: ingen. Avhengighetsfunn er dokumentert i [appoppsett](docs/app/oppsett.md).
- Release/deploy/signering: ikke konfigurert. Ingen publisering eller skyressurser uten fullmakt.
- Produktkode: legg til meningsfulle Vitest-enhets-/integrasjonstester og Playwright av hovedflyten.
  Minst 50 % dekning kreves til leveransen; ikke skjul manglende produktbevis bak grønn scaffold-CI.
- main er beskyttet: PR, grønn CI og oppdatert branch kreves; review er frivillig (Max 05.10). Se [CI](docs/app/ci-og-deploy.md).
- Test relevante brukerhandlinger på branch-bygget før mergeforslag. Rapporter faktiske utfall.
- Hold AGENTS.md og CLAUDE.md under ca. 200 linjer; detaljer skal bo i lenkede fagfiler.
