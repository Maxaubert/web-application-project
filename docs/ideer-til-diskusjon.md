# Prosjektideer til diskusjon med Emil

**Status 14.09.2026: kandidater til diskusjon med Emil. Ingen endelig prosjektidé er valgt.**
Notatet bevarer Max' tilbakemeldinger fra idérundene så langt. Det er skrevet med Codex,
ikke en avtale med Emil, egen studentrefleksjon eller rapportens arkitekturbegrunnelse.
Mulige avgrensninger og faglige muligheter nedenfor er assistentforslag.

## 1. School Hub

**Beholdt av Max:** samle Canvas, Outlook-e-post og Mine studier/timeplan i en nyttig
arbeidsflyt for studenten. Kandidaten handler om å følge opp studiearbeid på tvers av
kilder, ikke bare vise tre informasjonsstrømmer på samme side.

**Problem og målgruppe å undersøke:** studenter som må finne informasjon flere steder
og selv gjøre den om til handling, alene eller i en gruppe. Avklar hvilke konkrete
oppgaver Max og Emil faktisk mister oversikten over, og om andre opplever det samme.

**Foreslått hovedflyt fra diskusjonen:** emnekunngjøring → brukerbekreftet oppgave med
kildelenke → tildeling til seg selv eller gruppe → fullføring. Studenten bekrefter hva
som skal gjøres; importert tekst er ikke automatisk en korrekt tolket frist eller oppgave.

| Til diskusjon | Mulighet eller åpent spørsmål |
|---|---|
| Faglig mulighet | Eget skjema for kilde, oppgave, medlemskap og status; REST-ressurs, server actions og tilgangskontroll for personlige/gruppeoppgaver |
| Testbar flyt | Logg inn, opprett/bekreft oppgave, les den igjen og fullfør. Test at en utenforstående ikke kan lese eller endre gruppens private oppgaver |
| Tidligere undersøkt | Canvas-tilgang er tidligere demonstrert i arbeidet rundt emnet. Dette er ikke en ferdig integrasjon i dette repoet eller bevis på tilgang for alle studenter |
| Ikke verifisert | Outlook-appsamtykke og tilgang til Mine studier/timeplan. Ingen fungerende integrasjon med disse er lovet |
| Viktigste spørsmål | Hva gjør den samlede arbeidsflyten bedre enn kildenes egne oppgavelister? Hvilken informasjon må være privat, og hva kan deles med gruppen? |
| Risiko | Integrasjonstilgang, samtykke, synkronisering, duplikater og endrede frister kan ta mer tid enn selve oppgaveflyten |

**Assistentforslag til første avgrensning:** prøv én kilde og én full oppgaveflyt først.
Manuell innlegging med kildelenke kan brukes til å teste ideen dersom en integrasjon
ikke er tilgjengelig. Behold de tre kildene som visjon, men undersøk hver integrasjon
før den loves. Dette er et forslag til etapper, ikke en beslutning om å kutte Outlook
eller timeplan. Eventuell KI-tolkning er ikke valgt eller nødvendig for første utprøving.

## 2. Borrow Circle + Skill Swap + chat

**Beholdt og utvidet av Max:** ett fellesskap der folk kan låne/låne ut ting,
tilby/etterspørre ferdigheter eller hjelp, og kontakte personen i appen.
**Chat er en ønsket del av konseptet.** En egen generisk meldingstjeneste er ikke valgt,
og ende-til-ende-kryptering er ikke et uttrykt krav til denne chatten.

**Problem og målgruppe å undersøke:** et avgrenset fellesskap som vil finne både ting
og hjelp hos hverandre og avtale det praktiske. Hvilket fellesskap som passer, er åpent;
det kan diskuteres uten å låse ideen til skole eller et bestemt geografisk område.

**Assistentforslag til sammenhengende hovedflyt:** logg inn → legg ut tilbud/forespørsel
om en ting eller hjelp → en annen person tar kontakt i tilknyttet samtale → avtal og
fullfør lånet eller hjelpen. En mulig felles modell er tilbud/forespørsler med type
«ting» eller «hjelp», avtaler og samtaler. Dette er en skisse, ikke valgt arkitektur.

| Til diskusjon | Mulighet eller åpent spørsmål |
|---|---|
| Faglig mulighet | Relasjoner mellom bruker, oppføring, avtale og samtale; REST, server actions, eierskap og deltakertilgang |
| Testbar flyt | Opprett og finn en oppføring, avtal via chat og les avtalen igjen. Test at utenforstående ikke kan lese samtalen eller endre en annens oppføring |
| Viktigste spørsmål | Hvem er det første fellesskapet? Hva får noen til å tilby noe, og hva trenger mottakeren å vite før de tar kontakt? |
| Avtaler | Skal hjelp være gratis, gjensidig eller betalt? Hvordan representeres tidspunkt, tilgjengelighet, avlysning og fullføring? Ingen løsning er valgt |
| Chat | Hvem får starte en samtale, hvem kan lese den, og må den oppdateres i sanntid? Hvordan håndteres uønsket kontakt? |
| Risiko | Lån, hjelpetilbud og chat kan bli tre store delprosjekter. Tilgjengelighet, tillit og samtaletilgang må holdes forståelig og testbart |

**Assistentforslag til etapper:** hold én felles oppføring-/avtaleflyt for både ting og
hjelp, og knytt en enkel samtale til den. Vurder senere avansert booking, betaling,
omdømme og varslinger bare hvis behovet tilsier det. Enkel chat trenger ikke bety alle
funksjonene i en full meldingstjeneste. Etappene skal bevare den kombinerte visjonen,
ikke stille fjerne Skill Swap eller chat. Ingen avgrensning er avtalt med Emil.

## 3. «Will this setup actually work?»

**Beholdt av Max i runde 2:** hjelp til å vurdere om maskinvare fungerer sammen.
Eksempler fra Max er hovedkort/CPU, tastatur/skjerm og telefon/lader, eventuelt innenfor
en mer avgrenset produktkategori. Verken kategori eller endelig omfang er valgt.

**Problem og målgruppe å undersøke:** personer som vil vite om en kombinasjon vil
fungere før de kjøper eller setter opp utstyr. Verdien avhenger av at appen kan gi
relevante, etterprøvbare svar for produktene folk faktisk bruker.

**Viktig skille i diskusjonen:** det tidligere assistentforslaget bygget på
konfigurasjoner som brukere hadde prøvd og dokumentert. Max ønsker å undersøke et
bredere grunnlag med gode API-er eller datakilder som oppdateres automatisk og dekker
populære produkter. Brukertester og automatisk oppdaterte produktdata er ulike typer
evidens; den ene er ikke dokumentasjon på at den andre finnes.

| Til diskusjon | Mulighet eller åpent spørsmål |
|---|---|
| Foreslått hovedflyt | Velg produkter → se vurdering med kilde, forutsetninger og usikkerhet → lagre kombinasjonen. Dette er et assistentforslag, ikke vedtatt funksjonalitet |
| Faglig mulighet | Eget skjema for produkter, kombinasjoner, kilder og brukere; REST, server actions, lagring og eierskapskontroll |
| Testbar flyt | Logg inn, lagre en kombinasjon og les den igjen. Test at manglende data gir «ukjent», og at en annen bruker ikke kan endre en privat lagret kombinasjon |
| Avgjørende forutsetning | Finnes egnede API-er/databaser, lovlig bruk og en gjennomførbar måte å oppdatere data automatisk på? **Ikke undersøkt eller verifisert her** |
| Dekning og nytte | Max fremhever at manglende støtte for populære produkter vil svekke nytten og viljen til å bruke appen betydelig. Tilstrekkelig dekning må undersøkes før ideen velges |
| Kvalitet | Hva betyr «fungerer»: fysisk tilkobling, grunnfunksjon eller alle ønskede egenskaper? Hvilke modellvarianter og andre forutsetninger må vurderingen oppgi? |
| Omfang | Kan en mer avgrenset kategori gi god nok dekning og en nyttig tjeneste? Ingen kategori er bestemt |

**Før kandidaten kan velges:** undersøk datatilgang, oppdateringsmulighet, dekning av
populære produkter og hvor godt kildene faktisk støtter en kompatibilitetsvurdering.
Dette er en gjennomførbarhetskontroll som gjenstår, ikke et løfte om tilgjengelige API-er
eller full produktdekning. Ingen API-research eller implementering er gjort i denne oppdateringen.

**Ukjent må forbli ukjent.** Manglende data er verken bevis på inkompatibilitet eller
garanti for at noe virker. Vis kilde og forutsetninger, og skill en dokumentert brukertest
fra en vurdering basert på produktdata. Verken datamodell, stack eller løsning er avtalt med Emil.

## Hva dere kan avklare sammen

1. Hvilken konkret situasjon vil vi helst forbedre, og hvem kan vi undersøke behovet hos?
2. Hva er den minste sammenhengende flyten som fortsatt viser hvorfor ideen er interessant?
3. Hvilken usikkerhet bør prøves først: tilgang til datakilder, faktisk behov eller omfang?
4. Hva vil begge lære, og hvordan kan begge forklare hele løsningen til eksamen?

Kandidatene gir muligheter til å dekke [T01–T08](emnekrav.md), men en idéskisse
beviser ikke at kravene er oppfylt. Endelig valg, omfang og begrunnelse føres i
[prosjektkortet](prosjekt.md) når Max og Emil faktisk har diskutert og bestemt dem.

## Historikk og føringer for neste idérunde

| Idé | Max' tilbakemelding fra første runde |
|---|---|
| Decision Room | Litt interessant først, deretter uttrykkelig lagt bort fordi funksjonen ofte er innebygd i andre apper |
| Plan B | Likte ikke ideen; tas ikke videre |
| Build Journal | Avvist som kjent funksjonalitet som populære produkter allerede dekker godt |
| Watch Club | Avvist av samme grunn: kjent funksjonalitet som allerede er godt dekket |
| Selvstendig generisk kryptert messenger | Emils tidligere forslag; Max opplevde konseptet som kjent og lite interessant. Ikke en beholdt kandidat, og ingen vurdering av Emil som person |

| Idé | Max' tilbakemelding fra runde 2 |
|---|---|
| Samarbeidsspill i nettleseren | Avvist. Max presiserer uttrykkelig at prosjektet ikke skal være et spill |
| Praktisk stedsoversikt for tilgjengelighet | Avvist; tas ikke videre |
| Matching av restmaterialer | Avvist; tas ikke videre |

To senere forslagsrunder ble også avvist samlet. Max trakk spesielt frem UsedCheck,
Form Companion og Dataset Detective og sa at ingen av disse ideene var gode.
Det er ikke oppgitt en egen begrunnelse for hvert forslag; de felles føringene står nedenfor.

| Avvist forslag | Hva forslaget gjaldt |
|---|---|
| UsedCheck | Veiledet kontroll ved bruktkjøp |
| CaseFile | Tidslinje for en kundeservicetvist |
| Maker Match | Markedsplass for spesialtilpasset produksjon |
| Batch Club | Felles storbestillinger |
| Repair Relay | Reparasjonshistorikk |
| Explain Your Code | Muntlig eksamensøving med utgangspunkt i et repo |
| Migration Lab | Konvertering av dataeksporter |
| Form Companion | Veiledning gjennom kompliserte skjemaer |
| Dataset Detective | Felles rydding i datasett |
| Modular Manual | Feilsøkingsveiledninger med forgreninger |

Deretter avviste Max også disse fire forslagene:

| Avvist forslag | Hva forslaget gjaldt og eventuell oppgitt grunn |
|---|---|
| Where Is It? | Fotografert oversikt over oppbevaring hjemme. Ingen egen begrunnelse oppgitt |
| Return Desk | Kvitteringer og oppfølging av retur. Ingen egen begrunnelse oppgitt |
| Open Plans | Spontane planer med venner. Max' grunn: folk ville bare brukt Discord |
| Found It | Lokal tjeneste for mistet og funnet. Ingen egen begrunnelse oppgitt |

**Utforskende tanke fra Max, uavklart:** en hub for manualer til alle slags produkter,
der folk bidrar ved å laste opp manualer. Max uttrykte samtidig bekymring for at dette
blir for stort og ikke egentlig gjennomførbart, særlig med tanke på omfang og innholdsdekning.
Tanken er verken en beholdt kandidat eller en endelig avvisning. Ingen videre avgrensning,
datatilgang eller enighet med Emil er avklart.

Mellomrunden med Neighbour Deal, Move Relay, Handover, Space Match og Pop-up Lab har
ingen tydelig individuell vurdering i tilbakemeldingene. De registreres derfor verken
som beholdt eller avvist. De tre kandidatene øverst er fortsatt beholdt til diskusjon;
de nye avvisningene endrer ikke dette eller maskinvareidéens uavklarte datakrav.

**Max' utvalgskriterium:** temaet kan være gaming, skole, bedrift eller noe helt annet,
men **vi skal ikke bygge et spill**. Det utelukker ikke automatisk programvare for spillere.
Det avgjørende er reell nytte og en god grunn til å ta i bruk en egen applikasjon.
Unngå ideer der hele verdien er en liten funksjon som allerede er lett tilgjengelig
i etablerte produkter som fungerer godt. Kriteriet betyr ikke at kandidatene over
er uten konkurrenter; behovet og grunnen til å velge dem må fortsatt undersøkes.

**Håndterlig og nyttig for mange:** Max og Emil ønsker en overkommelig studentwebapp
for et problem de selv forstår og kan undersøke behovet for. Ideen bør ikke kreve
spesialistkunnskap eller overdreven teknisk kompleksitet. Verktøyet bør ha praktisk
hverdagsnytte for ganske mange mennesker, fremfor å rette seg mot en svært liten nisje.
Dette er et kriterium for valg av problem, ikke et krav om alle mulige funksjoner eller
universell dekning. Ingen endelig idé, avgrensning eller enighet med Emil er dokumentert.

Neste runder skal være brede og ikke ta utgangspunkt i Max' tidligere prosjekter eller
interesser. Prism er allerede bygget som filutforsker/webapp for ekstern filtilgang og
video på mobil, og er ikke en føring for nye forslag. Se etter en konkret arbeidsflyt
som er dårlig dekket, uten å påstå at ideen aldri har eksistert.

**Ønsket presentasjon:** i talesamtale presenteres ideene én om gangen, med rom for
oppfølgingsspørsmål. Max ba om dette da han ikke kunne se tabellen. Korte skriftlige
sammenligningstabeller er fortsatt et nyttig supplement. Ikke påstå at en tabell eller
annen visning er synlig uten å ha verifisert det. Nye forslag føres ikke opp som beholdte
kandidater uten uttrykkelig valg.
