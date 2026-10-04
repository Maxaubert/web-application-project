# Endringslogg

Løpende oversikt over vesentlige endringer i prosjektet: funksjoner, krav, beslutninger
og struktur. Nyeste først. Anbefalt av studentassistenten ved sign-off uke 40.

Detaljene står i Git-historikken og PR-ene; daglig arbeid står i
[arbeidsloggen](prosess/arbeidslogg-max-og-emil.md). Én linje per endring holder.
Skriv hvem som besluttet eller gjorde endringen, og lenk PR eller issue når det finnes.
Oppføringene til og med 05.10.2026 er rekonstruert fra Git-historikken samme dag.

## 2026-10-05

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
