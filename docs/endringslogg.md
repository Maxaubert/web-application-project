# Endringslogg

Løpende oversikt over vesentlige endringer i prosjektet: funksjoner, krav, beslutninger
og struktur. Nyeste først. Anbefalt av studentassistenten ved sign-off uke 40.

Detaljene står i Git-historikken og PR-ene; daglig arbeid står i
[arbeidsloggen](prosess/arbeidslogg-max-og-emil.md). Én linje per endring holder.
Skriv hvem som besluttet eller gjorde endringen, og lenk PR eller issue når det finnes.
Oppføringene til og med 05.10.2026 er rekonstruert fra Git-historikken samme dag.

## 2026-10-05

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
