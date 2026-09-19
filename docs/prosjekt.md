# Prosjektkort og første plan

**Teamutkast, oppdatert 19.09.2026.** Dette er arbeidsplanen, ikke en parallell kravspesifikasjon.
Kilde: [emnekrav](emnekrav.md) T01–T08 og [kilder](kilder.md) K01, U26 s. 152–159, 229.
Kvitter er undervisningsdemo. Velg et meningsfullt problem med sammenlignbart omfang,
ikke en samling tilfeldige funksjoner for å krysse av teknologi.

[Kravspesifikasjonen](../kravspesifikasjon.md) beskriver gjeldende studentmarked:
salg, gratis lån og betalt leie i MVP, med forespørsler og motforslag. Chat kommer senere.
Dette er Max' avklaringer; Emil og brukerbehov er ikke bekreftet. [Teknisk plan](teknisk-plan.md)
samler gjennomføringen. [Idénotatet](ideer-til-diskusjon.md) bevares som historikk.

## Beslutninger Max og Emil tar sammen

| Felt | Nå |
|---|---|
| Bruker og konkret problem | Studenter som trenger ting og studenter som tilbyr dem; behovet undersøkes, se kravspesifikasjonen |
| Mål: hva brukeren skal kunne gjøre bedre | TBD |
| Én hovedflyt: logg inn, lag noe, se det igjen | Publiser annonse → student foreslår avtale → eier svarer/justerer → studenten svarer på motforslag; detaljene står i kravspesifikasjonen |
| Egen ressurs, eier og relasjoner | TBD |
| Hva en annen bruker kan se og endre | TBD |
| Akseptansekriterier fra brukerens perspektiv | AK-01–AK-23 i kravspesifikasjonen, fortsatt utkast |
| Minste nyttige omfang, og hvordan det ligner kursets nivå | Alle tre handelstyper, uten chat eller innebygd betaling. Fullføringsregler gjenstår |
| Første funksjoner i prioritert rekkefølge | TBD |
| Kuttliste dersom tid/forståelse svikter | TBD |
| Stack: RedwoodSDK/Next.js/TanStack Start | TBD. RedwoodSDK følger undervisningen nærmest |
| Eksterne data, personvern og kostnader | TBD. Bruk syntetiske demoopplysninger |
| Ambisjon, kapasitet og avtalt arbeidsform | TBD, begge bekrefter selv |
| Gruppeendring meldt/avklart med faglærer | Ukjent. Bruker oppgir Max og Emil, ikke bevis på lærerens godkjenning |
| Remote, synlighet, lisens og sky | Privat GitHub-repo er opprettet og pushet med fullmakt. Lisens og sky er åpne |

Ikke velg app ut fra hvor mange avanserte utvidelser KI kan generere. Velg noe begge
kan lære å forklare hele veien. RAG, filopplasting og cron står utenfor første omfang
med mindre problemet faktisk trenger dem. Det er en teamanbefaling, ikke et emneforbud.

## Plan fra dokumentasjon til app

| Steg | Konkret resultat | Kontroll | Eier |
|---|---|---|---|
| 1. Avklar | Prosjektkort, gruppekontrakt og KI-avtale fylt av begge | Begge kan forklare problemet og kuttlisten | Max + Emil, ikke utført |
| 2. Oppsett | Offisiell starter for valgt stack, låsefil, kjøreoppskrift, CI-gater | Ren installasjon og start på begge maskiner | Avtales |
| 3. Første snitt | Liten ressursflyt gjennom UI, handler og lagring | Observerbart resultat og enkel feiltest | Avtales, bytt reviewer |
| 4. Sign off | Faktisk kode, nåstatus og konkrete hindringer | Fremvisning 29.09; logg faktisk oppmøte | Begge |
| 5. Bygg faglig videre | Eget DB-skjema, auth/eierskap, REST, integrasjon | T01–T08 med bevis, beskyttede øvinger utføres selv | Avtales |
| 6. Levering og øving | Reproduserbar app, egen rapport, demo og forklaring | Leveransesjekk og individuell prøve uten KI | Begge |

Dette er en rekkefølge, ikke påståtte sprintdatoer eller en lovnad om ferdig auth før
det undervises. En demo med midlertidig lagring/sesjon må merkes tydelig, isoleres og
erstattes før prosjektet kan dekke sluttkravene. Sjekk oppdatert undervisning underveis.

## Mal for en funksjon

Fyll i en issue/PR når funksjonen trenger spesifikasjon, ikke for hver linje:

- Problem, bruker og ønsket observerbar atferd.
- Krav-ID-er, scenarier og eksplisitt utenfor omfang.
- Input, output og feil; hvem eier ressursen og får utføre handlingen?
- Akseptansekriterier, inkludert avvist tilgang og uendret data.
- Åpne spørsmål og kuttmulighet. Deretter en kort teknisk plan.
- Student som implementerer, den andre som reviewer, og hva begge skal kunne forklare.

Skill atferdsspesifikasjon fra teknisk plan. Samle dem til én gjennomgang før en større
endring. Små feilrettinger trenger ikke et langt SDD-dokument (U26 s. 156–157).
