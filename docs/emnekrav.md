# Krav og sporbarhet

**Kontrollert 14.09.2026 mot Canvas**, kursplan K01, KI-avtale K02 og kunngjøringer
A08/A11/A14. [Kildeindeksen](kilder.md) forklarer autoritet, sidetall og oppdatering.
Dette er vår syntese, ikke en ny kontrakt med faglærer Marius Johansen Wallin.

Kategorier: **Krav** = gjeldende Canvas eller uttrykkelig utdyping i 2026.
**Undervisning** = faglig innhold/øving, ikke automatisk en innlevering.
**Anbefaling** = lærerens råd. **Teamstandard** = vårt arbeidsoppsett.
**Åpent** = må avklares. Ved motstrid vinner nyere relevant Canvas-presisering.

## Seks arbeidskrav og individuell eksamen

Ingen studentgodkjenning er dokumentert i dette nye repoet. «Ukjent» betyr at vi
ikke har kontrollert studentens vurderingsstatus, ikke at vedkommende har strøket.

| ID | Krav | Bevis som senere føres inn | Status | Kilde |
|---|---|---|---|---|
| A0 | Egen fungerende fullstack-app, kode og prosess, levert før presentasjon | Innleveringskvittering + testet commit/pakke + T01–T08 | Ikke påbegynt her | K01 §8 krav 0 |
| A1 | Faglig relevant lyntale, 5 min + 2 min spørsmål, maks 3 valgfrie slides, alle deltar | Faktisk dato, tema/kilde, individuell deltakelse, godkjenning | Ukjent | K01 §8 krav 1; A11 |
| A2 | Retrospekt fra uke 37, aktiv individuell deltakelse når trukket | Faktisk deltakelse og lærerens godkjenning, ikke egen avkrysning alene | Ukjent | K01 §8 krav 2; A14 |
| A3 | Sign off, én fremvisning av faktisk kode/status/hindringer til Khalil eller Aleks | Oppmøte og bekreftelse | Ukjent | K01 §8 krav 3, §11 |
| A4 | Prosjektpresentasjon 10–15 min inkludert spørsmål, synlig rolle for alle | Dato, gjennomført demo, godkjenning | Ikke påbegynt her | K01 §8 krav 4 |
| A5 | Én ærlig rapport, maks 3 A4, seks temaer, før presentasjonen | Egen tekst, levert fil og kvittering | Ikke skrevet | K01 §8 krav 5; U26 s. 230 |
| E1 | Alle krav godkjent før muntlig gruppeeksamen | Bekreftet status for hver student | Ukjent | K01 §§1,9,12 |
| E2 | Muntlig 20–30 min, ingen hjelpemidler, case ved eksamen eller inntil én uke før, individuell A–F | Individuell øving er forberedelse, karakter/godkjenning bestemmes av institusjonen | Ikke prøvd | K01 §12 |

Prosjektet gir godkjent/ikke godkjent. Karakteren avgjøres muntlig og individuelt.
Alle må kunne forklare hele appen og gjøre en liten endring på stedet, ikke bare «sin» fil.

## Teknisk minimum og hvordan det skal kunne bevises

**Oppsettsstatus 20.09.2026:** RedwoodSDK-starter og lokale verktøy finnes, se
[appoppsettet](app-oppsett.md). Ingen T-rad er ferdig dokumentert/godkjent for produktet.
Eget skjema, API, auth, hovedflyt og integrasjon/dekning gjenstår. Fyll inn reelle bevis underveis.

| ID | Verifisert krav | Forventet evidens, foreløpig plan | Kilde |
|---|---|---|---|
| T01 | RedwoodSDK på Cloudflare med server-/klientkomponenter. Nyeste Next.js eller TanStack Start også tillatt med samme bevisste skille; annet forhåndsgodkjennes | Valgt versjon/låsefil, begrunnelse, faktisk komponentgrense; eventuell godkjenning | K01 §8 krav 0, Stack |
| T02 | Drizzle mot D1 og eget designet skjema. Next/TanStack kan bruke annen database; skjemaet er fortsatt eget | Schema, migrasjoner, relasjonsforklaring, lagret data lest tilbake | K01 §8 krav 0, Database |
| T03 | Minst ett REST-endepunkt med ressurs-URL, korrekt HTTP-metode og status også ved feil | Dokumentert kontrakt + tester av suksess/input/tilgang/ikke funnet etter behov | K01 §8 krav 0, API |
| T04 | Skriving via server actions med autorisasjon i handleren; TanStack bruker server functions | Handler med sesjon/rolle/eierskap, test av manglende sesjon og feil bruker | K01 §8 krav 0, Skriving; U26 s. 69,201,224 |
| T05 | better-auth eller tilsvarende og minst én beskyttet rute | Virkelig login/sesjon/logout og avvist ubeskyttet tilgang, ikke en hardkodet bruker | K01 §8 krav 0, Innlogging |
| T06 | Én fungerende hovedflyt: logg inn, lag noe, se det igjen; eget meningsfullt omfang på nivå med demoen | Gjennomført flyt med varig data, normal bruk uten kritiske terminal-/konsollfeil | K01 §8 krav 0, Hovedflyt og leveransepunkt 1–2 |
| T07 | Vitest, minst én integrasjonstest av hovedflyten og minst 50 % dekning med `vitest run --coverage` | Faktisk testresultat/dekningsrapport og forklaring av hva testene fanger | K01 §8 krav 0, Tester; U26 s. 230 |
| T08 | README beskriver start, tester og dekning. All nødvendig kode med; ingen avhengighetsmapper, bygg eller hemmeligheter | Reprodusert på annen maskin fra README; kontrollert innleveringspakke | K01 §8 krav 0, README og leveransepunkter |

Dekningens eksakte målekategorier er ikke presisert i tabellen. Ikke oppfinn en
Canvas-regel om bare linjer eller alle fire mål. Teamforslag: vis alle kategorier,
avklar behov, og ikke ekskluder vanskelig appkode for å oppnå tallet.
U26 s. 136 har et eget 60 %-mål i en komponentøving, ikke et nytt globalt minimum.

## Samarbeid, KI og leveringsform

| ID | Krav | Evidens/status | Kilde |
|---|---|---|---|
| P01 | .git følger leveransen; GitHub-repo offentlig ved innlevering og lenke i rapport | Privat GitHub-repo finnes. Fremtidig offentliggjøring og pakking må avklares og verifiseres | K01 §8 krav 0, punkt 4 |
| P02 | Ekte bidrag under eget navn gjennom semesteret; historikken må stemme med refleksjonen | Studentbidrag ikke etablert her. Commit-antall er ikke forståelsesmål | K01 §8, Om git-historikken |
| P03 | Gruppekontrakt og felles forståelse av ambisjon, arbeidsform, KI og tema | [Utkast](samarbeid.md), ikke avtalt av studentene | A29, A04 |
| P04 | KI-avtale i repo, svar verifiseres, KI-bruk dokumenteres og avtalen oppdateres ved behov | [Utkast](../KI-AVTALE.md), ikke bekreftet av studentene | K02; K01 §8 krav 5 |
| P05 | Egne arkitekturbegrunnelser i rapporten uten KI-generert tekst | Ikke skrevet. Nøytral [mal](teknikk.md) og kildestøtte er hjelp, ikke besvarelse | U26 s. 230, linje 8089–8095 |
| P06 | Alle deltar, viser respons på tilbakemelding og svarer uten hjelpemidler. KI kan brukes i forberedelse, ikke live-svar | Individuell status ukjent | K01 §9 og §8 krav 0/4 |

Manglende deltakelse skal fremgå ærlig av rapporten og tas opp tidlig. Ikke skriv
om andre studenters private forhold i en offentlig logg. Bruk nødvendig saklig
beskrivelse og avklar sensitiv kommunikasjon med studentene.

## Frister, konflikter og usikkerhet

| Hendelse | Status 14.09.2026 | Praktisk handling |
|---|---|---|
| Gruppeskjema 27.08 | Historisk frist; individuell innlevering ikke kontrollert her | Kontroller egen status ved tvil |
| Gruppe Max + Emil | Opplyst av bruker. A11 sier grupper låst og endringer må avklares | Studentene avklarer endring med faglærer; ingen melding sendt her |
| Sign off 29.09 kl. 12–14, Europe/Oslo | K01 §§8,11 kontrollert live | Ha faktisk kode og konkrete hindringer å vise |
| Egen lyntale-slot | Ikke verifisert etter nye oversikter 08.09 | Les gjeldende gruppetildeling, ikke stol på gammel 20.10-slot |
| Prosjektpresentasjon | K01 §1 sier etter uke 42; §3/§8 sier etter uke 45 | Reell kildekonflikt, dato TBD til ny presisering |
| Rapport og kode | Før gruppens prosjektpresentasjon | Arbeid bakover fra bekreftet dato, ikke oppdiktet frist |
| Eksamen | Nøyaktig dato ukjent, K01 antyder slutt november til midt desember | Kontroller offisiell eksamensplan |

Ved fravær: gi beskjed tidlig. K01 §10 har ulike regler: minst én uke før ønsket
bytte; fravær fra lyntale/retrospekt meldes ved dagens start; sykdom samme dag.
Lyntale tas alene påfølgende uke, retrospekt har én ekstra sjanse og gruppeoppfølging.
Ingen automatisk ny sjanse etter prosjektpresentasjonen. Ikke anta at sign off har en reserve.

**A14 presiserer retrospekt:** banken inneholder også kommende stoff som forberedelse,
ikke krav om å kunne langt fremtidig pensum. Tekniske detaljer, refleksjon og anvendelse
teller. Uttrukne prioriteres til alle har fått anledning til minst ett svar; quiz teller
også som bidrag. Det går an å si pass, men dette erstatter ikke kravet om deltakelse.
Live-banken selv er ikke kontrollert i denne gjennomgangen.

Ved ukentlig gjennomgang: sjekk om lyntale/presentasjon kolliderer med app- og rapportarbeid,
og om den enes oppgave avhenger av den andres. Andre emnefrister er ikke undersøkt her.

## Kvalitetsdimensjoner og valgfrie utvidelser

K01 vurderer React, TypeScript-grenser/props/state, ruting, UI, eget skjema,
design patterns, refaktorering, konsistens og kodekvalitet. Responsivitet, eksterne
data/biblioteker og begrunnelser, reelle tester og auth vurderes langs disse dimensjonene.
Dette er ikke en ordre om å legge inn et tilfeldig eksternt API.

Deploy anbefales, men er ikke obligatorisk. Seed/demo-data er et godt læreråd (U26 s. 231),
ikke et separat minstekrav i Canvas-tabellen. L11–15-prinsippene er pensum/eksamensrelevante,
mens full implementasjon av RAG, R2, cron og avansert auth ikke er påkrevd (U26 s. 232).
