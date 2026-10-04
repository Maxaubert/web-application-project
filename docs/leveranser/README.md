# Leveranser, fremvisning og eksamen

Kildene er [emnekrav](emnekrav.md) A0–A5/E1–E2 og [K01 §8–12, U26 s. 229–232](kilder.md).
Dette er en sjekkliste og en disposisjon, **ikke ferdig studentrapport**.
Ingen avkrysninger er gjort på studentenes vegne.

## Lyntale, A1

- Velg ett relevant faglig tema, kilde og poeng. Forklar hva, relevans og egen vurdering.
- 5 minutter + 2 minutter spørsmål, maks tre valgfrie lysbilder. Ingen forhåndsinnlevering.
- Alle deltar. Ha teknisk innhold og tilstrekkelig bredde/dybde, jf. A11.
- Verifiser gjeldende slot etter endringene 08.09. Ikke bruk gammel gruppeoversikt som fasit.
- Øv med klokke og på å svare uten KI. KI kan brukes i forberedelsen.
  Følg opp fravær og lærerens bekreftelse.

## Sign off, A3

29.09.2026 kl. 12–14 norsk tid, kontrollert i K01. Vis faktisk kode til Khalil eller
Aleks, fortell hvor dere er og hva som blokkerer. Ett møte holder; det er ikke en
formell presentasjon eller automatisk kvalitetsgodkjenning av appen.

Før møtet: ha appen/prosjektet tilgjengelig, kjør det som faktisk finnes, og noter
to konkrete spørsmål. Etterpå: før faktisk oppmøte og eventuell tilbakemelding, ikke
en oppdiktet «signert» status. Bare docsgrunnlaget er ingen ferdig app å vise.

## Rapport, A5

Maks **3 A4-sider**, én rapport i Canvas før prosjektpresentasjonen. Studentene skriver
konkret med egne erfaringer. Sjekk faktisk sidetall i ferdig eksport, ikke antall Markdown-linjer.
Lenk offentlig apprepo ved innlevering (P01). Disposisjonen har seks obligatoriske deler:

| Del | Egen tekst skal svare på | Samle reelle bevis fra |
|---|---|---|
| 1. Kort om prosjektet | Hva appen er og hva målet var | Prosjektkort og faktisk hovedflyt |
| 2. Arkitekturvalg | Hva dere valgte, hvorfor, alternativer og avveininger | Egne beslutningsnotater og kode. **Skrives uten KI-generert tekst**, P05 |
| 3. Bruk av KI | Hvilke verktøy, til hva, og hva dere sitter igjen med | KI-avtale, faktisk bruk, nyttige og misvisende forslag |
| 4. Utfordringer | Hva gikk galt, hvordan ble det løst | Bugs, tester, endringer og tilbakemeldinger |
| 5. Gruppearbeidet | Fordeling, samarbeid og ærlig deltakelse | Ekte historikk og studentenes egne beskrivelser |
| 6. Læringsutbytte | Hva dere kan nå som dere ikke kunne ved start | Reelle forklarings-/endringsforsøk, ikke KI-genererte mestringspåstander |

Assistenten skal ikke fylle ut studentenes resonnement eller refleksjon. Den kan hjelpe
med kildefinning, forståelse, nøytrale spørsmål og kontroll av format mot kravene.
Beskriv manglende deltakelse ærlig, uten unødvendige private detaljer.

## Prosjektpresentasjon, A4

10–15 minutter **inkludert spørsmål**. Alle har aktiv rolle og kan svare om hele appen.
Dato er uavklart på grunn av konflikt etter uke 42/45, se emnekrav.
K01 gir denne anbefalte kjøreplanen; det er en fordeling, ikke seks separate krav:

| Tid | Innhold |
|---|---|
| 0–1 min | Problem, app og mål |
| 1–5 min | Én hovedflyt hele veien |
| 5–9 min | To eller tre valg og begrunnelser |
| 9–10,5 min | Noe som fungerte og noe dere ville endret |
| 10,5–12 min | KI: verktøy, god og dårlig erfaring, egen forståelse |
| 12–15 min | Spørsmål og mulig liten kodeendring |

Planlegg 12 minutter innhold. Test skjerm/demo på forhånd, ha syntetiske data,
app og editor klare. Lysbilder er valgfrie; U26 anbefaler fire/fem hvis brukt, ikke
lyntalens maks tre. Ikke les rapporten høyt. Ingen ny sjanse automatisk ved fravær.

## Før kodepakken sendes, A0/P01

- [ ] Bekreftet dato, kanal og gruppens innleveringsstatus. Alle seks arbeidskrav fulgt opp.
- [ ] App startet fra README på annen maskin/ren kopi, med riktige lokale miljøvariabler.
- [ ] T01–T08 dokumentert med faktisk evidens; normale flyter uten kritiske feil.
- [ ] Vitest/integrasjon/dekning kjørt; både testkvalitet og minimum 50 % kontrollert.
- [ ] Ekte .git-historikk og nødvendig kildekode med, inklusive bevarte bidrag før squash.
- [ ] Ingen node_modules, byggefiler, hemmeligheter, private logger eller kursarkiv i pakken.
- [ ] Historikken også kontrollert for sensitive data. .gitignore beskytter ikke gamle commits.
- [ ] Offentlig apprepo opprettet først etter fullmakt, innhold kontrollert og lenke i rapport.
- [ ] Rå kursmateriale, andres arbeid og OS-bedriftsdokumenter er ikke lastet opp.
- [ ] Endelig pakke åpnet og testet; ikke bruk `git archive` alene, fordi det utelater .git.
- [ ] Egen rapport innenfor tre sider, KI-bruk dokumentert og eget resonnement beholdt.
- [ ] Innsending og kvittering bekreftet faktisk. Et lokalt utkast er ikke en innlevering.

Ekskluder private/skjulte driftsfiler fra arbeidskopien uten å slette studentenes arbeid.
Ved behov bygg en egen kontrollert pakkemappe. Ikke slett eller rens .git for å skjule
historikk. Ved funn av hemmelighet: stopp publisering og avklar konkret opprydding/rotasjon.

## Muntlig eksamen, E1/E2

Kontroller individuell godkjenning av alle arbeidskrav. Øv 20–30 minutter uten
hjelpemidler på et nytt case, så begge må resonnere fremfor å gjengi en memorert demo.
Case gis ved eksamen eller inntil én uke før; innholdet er ukjent. Karakter er individuell.
Bruk [læringskartet](laering.md), inkludert L11–15-prinsippene, og repeter faktiske hull.
Ingen assistent skal levere live-svar under denne vurderingen.
