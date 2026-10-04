# Samarbeid og Git

**Utkast til gruppekontrakt, ikke inngått avtale.** Max og Emil er gruppen etter
brukerens opplysning. Formell gruppeendring og fast studentassistent er ikke kontrollert.
Kurskilder: [P02–P04](../emne/emnekrav.md). PR/merge-gaten nedenfor er Oves arbeidsregel,
ikke et ekstra Canvas-krav. Scrum, sprinter og egen timelogg er ikke påkrevd i K01.

## Gruppekontrakt: fylles av begge

| Tema | Avtale |
|---|---|
| Felles ambisjon og realistisk kapasitet | TBD |
| Arbeidstid, møtepunkt og svarfrist | TBD |
| Oppgavefordeling og ansvar ved forsinkelse | TBD |
| Roterende implementering/review og felles eierskap | Forslag: den andre reviewer, bytt fagområde jevnlig |
| KI-verktøy og grenser | [KI-avtalen](ki-avtale.md), godtatt av begge 30.09 |
| Tema, minste omfang og kuttliste | Studentmarked (Max 29.09); omfang i [kravspesifikasjonen](../krav/kravspesifikasjon.md) |
| Uenighet, fravær og manglende bidrag | Forslag: ta det opp tidlig, vis konkret hindring, avtal tiltak, kontakt faglærer ved behov |
| Gruppeendring og studentassistent | Avklares av studentene; ingen henvendelse sendt av assistenten |
| Bekreftelse | Max: ikke gitt. Emil: ikke gitt. Dato: TBD |

Praktisk forslag: kort møte etter undervisning. Hva virker, hva forstår hver av oss
ikke ennå, og hva blokkerer neste steg? Oppgaveeier betyr ansvar for fremdrift, ikke
at resten av løsningen er den andres pensum. Ved avhengige oppgaver avtal typer/
funksjonssignaturer og grensesnitt før dere jobber separat.

## Git-flyt som bevarer faktisk deltakelse

1. Bruk egen reell Git-identitet. Kontroller `git config user.name` og `git config user.email`.
   Ikke bruk medstudentens navn eller del innlogging. Ikke sett studentidentitet for KI-jobber.
2. Funksjonsendringer beskrives i issue først, på [Kanban-boardet](https://github.com/users/Maxaubert/projects/1).
   Ikke oppfinn issue-nummer.
3. Opprett branch `type/issue-slug`, for eksempel `feat/ressursflyt` uten nummer til issue finnes.
   Små docs-/feilrettinger trenger også branch og PR. Ingen endring pushes direkte til hovedbranch.
4. Commit faktiske sammenhengende endringer underveis: `type(scope): kort beskrivelse`.
   Ved KI-bidrag skal verktøy og rolle være synlige; bruk harnessens co-author-trailer der relevant.
   Ikke tilbakedater, del opp en ferdig leveranse for å late som semesterarbeid eller fabrikér bidrag.
5. Den andre studenten leser diffen, prøver berørt flyt og kan forklare endringen.
   Bruk [PR-malen](../../.github/PULL_REQUEST_TEMPLATE.md), krav-ID og faktisk verifikasjon.
6. Kjør relevante gater. App: full unit/typecheck/lint, integrasjon/dekning og Playwright
   lokalt ved UI. Docs: docsjekk og diffkontroll. Skill «kjørt» fra «planlagt».
7. Vis branch-bygget lokalt for brukerprøving før mergeanbefaling av UI-endring.
   Oppgi konkret PR og spør Ove «merge?» én gang når den er klar.
8. Merge bare etter godkjenning av den konkrete PR-en. Ingen auto-merge eller gjenbruk
   av godkjenning fra en annen PR. Squash-merge med reelle forfattertrailere der relevant.

**Historikken til eksamen:** squash kan fjerne individuelle commits fra hovedbranch.
Bevar derfor den opprinnelige featurehistorikken i lokale arkivrefs/tags før branch
slettes, og behold PR-lenker og ekte medforfattere. Eksempel etter gjennomgang:
`git tag archive/oppgave-slug <verifisert-feature-commit>` før sletting.
Bruk faktisk commit, ikke skriv vinkelparentes-placeholder som kommando. Avklar opplasting
av arkivtags før push. Kontroller at .git-pakken som leveres inneholder sporene. Git-statistikk
alene er ikke forståelse, og et co-author-navn er ikke bevis på at noen skrev eller kan koden.

GitHub-repoet er offentlig (kontrollert 05.10.2026). Ikke publiser nye ressurser som del
av «oppsett» uten fullmakt. Innleveringen må fortsatt oppfylle P01.

## Konflikter og kvalitet

Ved mergekonflikt: les begge intensjoner, bevar reelt arbeid, og test det samlede
resultatet. Ikke løs med blind ours/theirs, force-push eller sletting av andres endringer.
Bruk bare egne arbeidsfiler. Meld tidlig fra til medstudenten om en avhengighet blokkerer.

Manglende deltakelse må omtales ærlig i rapporten. Hold offentlig logg saklig og minimal,
og ikke legg inn helseopplysninger, private meldinger eller motivgjetninger.
Ikke mål samarbeid i et krav om like mange commits. Begge må delta og forstå hele appen.
