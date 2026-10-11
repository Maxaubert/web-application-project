# Endringslogg

Løpende oversikt over vesentlige endringer i prosjektet: funksjoner, krav, beslutninger
og struktur. Nyeste først. Anbefalt av studentassistenten ved sign-off uke 40.

Detaljene står i Git-historikken og PR-ene; daglig arbeid står i
[arbeidsloggen](prosess/arbeidslogg-max-og-emil.md). Én linje per endring holder.
Skriv hvem som besluttet eller gjorde endringen, og lenk PR eller issue når det finnes.
Oppføringene til og med 05.10.2026 er rekonstruert fra Git-historikken samme dag.

## 2026-10-11

- «Legg ut annonse» (FK-03) uten bilder: skjermbildet `/listings/new` etter mockup 13 (valgt blant tolv helsidemockups),
  med mini-forhåndsvisning som følger med, låst bildeflate til #61, feilboks med fokus og bekreftelse på den nye
  annonsesiden. «Legg ut annonse» i toppen. (Max, #133)
- Serverhandlingen for «Legg ut annonse» (FK-03): Zod-validering med norske feilmeldinger, alle feil samtidig,
  pris etter handelstype og eier fra økten. Høyeste pris satt til 100 000 kr, også i prisfilteret. Skjermbildet
  kommer i neste PR, bilder i #61. (Max, #131)

## 2026-10-10

- Småfeilrunde etter Max sitt funn: pekehånd også på selve avkrysningsboksen og nedtrekkslisten, «ikke tillatt»
  på låste felt, og telefonfeltet har samme mørke fokuskant som de andre feltene. Alle sider skannet automatisk
  for peker, klikkflater og synlig fokus på desktop og mobil; ingen andre funn. (Max, #128)
- Filtrene virker med én gang uten knapp (klientnavigasjon, fokus blir stående), pris når man forlater feltet.
  Opsjoner som ikke gir treff er grå. Filtreringen flyttet fra SQL til én ren funksjon på serveren etter søket,
  så de grå opsjonene alltid stemmer med søkeordet; tallkallet for «Vis X annonser» er fjernet. (Max, #122)
- Prisfeltene i filtrene er tekstfelt med tallastatur i stedet for `type="number"`: ingen pilknapper og ingen
  verdiendring ved rulling. (Max, #120)
- Filtre på forsiden: kategori, handelstype, tilstand og pris fra/til, i kolonne til venstre på desktop og bak en
  «Filtre»-knapp på mobil. «Vis X annonser» viser antallet mens man velger. Filtrert i SQL, validert med Zod,
  400 ved ugyldig verdi; `GET /api/listings` godtar de samme filtrene. Valgt etter mockups; sortering skilt ut
  som #116. (Max, #102)
- UI-finpuss etter Max sin test og en review-workflow: mørk kant i stedet for blå ramme på tekstfelt, pekehånd
  på knapper, logo lenker til forsiden, egen fanetittel per side, synlig fokus på kort, tydeligere markert
  søkeforslag, lange ord brytes, feil leses opp av skjermleser, og flere små hover- og størrelsesrettinger. (Max, #113)
- Live søkeforslag: fra to tegn viser søkefeltet de fem beste treffene mens man skriver, med piltaster, Enter,
  Escape og «Vis alle treff». Henter fra `GET /api/listings`; testet i ekte nettleser med Playwright. (Max, #104)
- Innloggede nettlesertester uten appkode: Playwright får en testøkt lagt rett i den lokale databasen og en
  signert cookie. Første tester: åpne en annonse fra kortet, og søkeskjemaet. (Max, #94)
- Lokal innloggingssnarvei `/dev/login` for seed-brukeren, bare under `npm run dev`. Endrer beslutningen fra
  05.10 om ingen innloggingsbakdør; begrunnelse: rask lokal testing. To låser, og Playwright beviser 404 i
  produksjonsbygget. (Max, #106)
- REST-endepunktet `GET /api/listings?q=&limit=` (T03): samme søk som forsiden som JSON med fem felt, 400 ved
  ugyldig søk, 401 uten økt, 403 uten kontooppsett, 405 for andre metoder. Egen API-vakt `requireApiUser`.
  Datakilde for live søkeforslag (#104). (Max, #98)
- Søk på forsiden (WF-03): feiltolerant søk i tittel, beskrivelse og selgerens navn med Fuse.js, best treff
  først. Søket står i adressen (`?q=`), ugyldig søk gir 400, ingen treff gir «Ingen annonser passer søket».
  FK-02 utvidet med selgerens navn og feiltoleranse. Filtre, «Vis flere» og REST-endepunktet er egne issues
  (#102, #101, #98). (Max, #97)
- Emils uferdige `app/src/sortedList.tsx` er slettet: sortering står ikke i kravene, og søket erstatter den.
  Max og Emil har avtalt at kodekvalitet går foran hvem som skrev koden. (Max, #97)

## 2026-10-08

- Annonsesiden `/listings/:id` (WF-04): kortet på forsiden lenker dit, og siden viser type, tittel, pris,
  kategori, tilstand, beskrivelse og eierens fulle navn. Solgte annonser vises med «Solgt»-merke; nedtatte og
  ukjente gir samme borte-visning med 404. Ingen handlingsknapp før bud- og lånesidene finnes. (Max, #91)
- Nye krav: solgte annonser fjernes etter 30 dager (#92), og klikk på eierens navn viser brukerens andre
  annonser (FK-13, #93). Fullt navn i stedet for fornavn på annonsesiden. (Max)
- Emils uferdige `app/src/sortedList.tsx` gjorde `develop` rød. Minste retting for å få CI grønn: type på
  `event`, `Number(...)` på valgt verdi, ubrukt import fjernet og lint for ubrukte variabler og `any` slått av
  i bare den fila til den er ferdig. Resten er urørt. (Max, #91)

## 2026-10-07

- Appnavnet er Studentmarkedet, som domenet: topplinjen, fanetittelen, avsendernavnet og emnet i
  innloggingseposten. (Max, #88)
- Automatisk deploy til studentmarkedet.org fra `main` etter grønn CI, med skymigrasjon før koden
  (`.github/workflows/deploy.yml`). (Max, #82)
- Forsiden viser aktive annonser som kort, nyeste først, med «type · pris» som i WF-03. `PageShell` har fått
  bredt oppsett og «Logg ut» i topplinjen (#65). Emils utkast `app/src/post.tsx` er fjernet; kortet tar over visningen. (Max, #79)
- Annonsetabellen `listing` med låste kategorier, handelstyper, tilstander og statuser, sjekket både i
  TypeScript og i databasen, pluss lokale testannonser (`npm run db:seed:local`). (Max, #79)
- `develop` har nå lett grenbeskyttelse: GitHub krever ikke lenger PR eller grønn CI der, men blokkerer
  sletting og force-push. `main` er uendret. Arbeidsregelen om PR for alle endringer står. (Max, #75)
- Appen flyttet til eget domene https://studentmarkedet.org; workers.dev-adressen er slått av (Max).
- Innloggingskoder sendes på e-post med Resend fra eget domene `studentmarkedet.org` (kjøpt av Max hos
  Cloudflare). EmailJS med Gmail/GMX ble prøvd og valgt bort. (Max, #46)
- Appen på nett: Cloudflare Worker `webapp` med D1 `webapp-db` i skyen, deployet av Max etter KI-kurset
  leksjon 10 (#70). Innlogging på nett venter på EmailJS (#46).
- Regel om små PR-er i AGENTS.md: én oppgave, sikt mot under ca. 400 håndskrevne linjer; rundt 1000
  er for stort (faglærer, gjengitt av Max). (Max)

## 2026-10-05

- Komponentprinsipper vedtatt etter kryssjekk mot Fullstækk: del etter ansvar, én liten delt Button
  med tre varianter, «Legg ut annonse» som ett skjema med tre utskilte deler. Åpne beslutninger
  lagt på boardet (#61–#66). (Max, #60)
- `develop` har samme grenbeskyttelse som `main`; direkte push blokkeres. Oppskriften
  `.github/branch-protection.json` rettet (tom `contexts` sammen med `checks` ble avvist av GitHub). (Max, #58)
- Dependabot lager PR-er mot `develop` (Max).
- `develop` gjenopprettet som integrasjonsbranch: PR-er til `develop`, `develop` → `main` i egen PR
  med merge commit. CI kjører også for `develop` (Max, #51).
- Kanban-flyt i CLAUDE.md: hver funksjon eller retting på boardet før arbeid, To do → In progress →
  Review → Done. `develop` slettet; bare `main` er fast branch (Max, #49).
- Innlogging med engangskode på e-post bygget (#47): bare kode, 6 sifre, 5 min, 3 forsøk,
  maks 5 koder per adresse per time, økt i 30 dager, kontooppsett med land og telefon, logger med
  maskert e-post, Tailwind. Telefon på én rad med rundt flagg og landskode; skjema i kort på
  desktop som i wireframes (Max' håndtest). Lokalt vises koden også i nettleserkonsollen. Valgene forsvart av Max i gjennomgang med Claude Code; koden skrevet
  av Claude Code. Lokalt skrives koden til terminalen; ekte e-post er #46. (Max)
- Innloggingslenken i e-posten er tatt ut av kravene (Microsoft Safe Links). Feide er bekreftet
  valgt bort: krever godkjenning hos Sikt og aktivering hos HiØ. (Max)
- L8a-raden er fjernet fra KI-avtalen; den var ikke avtalt. Tester skrevet av KI beskrives og
  godkjennes av Max først. (Max)
- [Review-sjekkliste](prosess/review-sjekkliste.md) for krav, dokumentasjon, struktur, overkomplisering,
  Fullstækk, sikkerhet, tester og logging, og `/prosjektreview` i Claude Code som kjører den. (Max)
- Arbeidsregler skjerpet i AGENTS.md: stegvis arbeid med plan først, studentene bestemmer,
  dokumentasjonen holdes konsistent i samme PR, School og Fullstækk-kurset sjekkes før krav og review.
  Max er eneste mergegodkjenner i reglene. PR-malen har ny sjekkliste. Claude Code skal utfordre hvert ikke-opplagt valg
  med spørsmål som studenten må forsvare (CLAUDE.md). (Max)
- Dokumentasjonen samlet i `docs/` med undermapper for krav, app, design, prosess, emne,
  leveranser og arkiv. Akseptansekriteriene er skilt ut fra kravspesifikasjonen.
  Utdaterte planfiler er flyttet til [arkivet](arkiv/README.md). (Max, med Claude Code)
- Endringsloggen opprettet. Studentassistentens KI-veiledning fra sign-off ført inn i
  [KI-avtalen](prosess/ki-avtale.md). (Max)
- Påkrevd review fjernet fra beskyttelsen av main; PR og grønn CI kreves fortsatt (Max, #38).
- TODO-listen erstattet av [Kanban-boardet](https://github.com/users/Maxaubert/projects/1) med
  GitHub Issues (Max, #36).
- `develop` flettet inn i main: innlogging, wireframes, sign-off og logg (Max og Emil, #35).

## 2026-09-30

- KI-avtalen godtatt av Max og Emil.
- Første enhetstest (lånepris), rapportdisposisjon med plassholdertittel og sign-off-side
  med bevis for alle Canvas-punktene. (Max)

## 2026-09-29

- Wireframes og skjermspesifikasjon for hovedflyten, og kravspesifikasjonen oppdatert etter
  Max' avklaringer 28.–29.09 (Max, #11).
- Innloggingssiden videreutviklet (Emil). Typer og grønn CI for innloggingskomponentene (Max, #37).
- Arbeidslogg, timeliste og lokal WAL-rutine innført (Max, #12).

## 2026-09-23

- `"use client"` lagt til i innloggingskomponenten, som rettet useState-feilen (Emil).

## 2026-09-21

- RedwoodSDK-appgrunnlag med lokal D1, Drizzle, Vitest og Playwright (Max, #3).
- Innloggingssiden påbegynt (Emil).

## 2026-09-19

- Prosjektgrunnlag: emnekrav, kilder, kravspesifikasjon for studentmarkedet og CI-pipeline
  (Max, #1 og #2).

## 2026-09-18

- Repoet opprettet (Max).
