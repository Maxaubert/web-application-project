# Review-sjekkliste

Felles sjekkliste for review av PR-er og av hele prosjektet, med eller uten KI.
Claude Code kjører den med `/prosjektreview`; med Codex eller for hånd går dere gjennom
punktene selv. Opprettet 05.10.2026 etter Max' bestilling.

**Før review:** kjør `git pull` i `../School` og les de nyeste Canvas-kildene der. Slå opp i
Fullstækk-kursene etter rutinen i `School/ITF31619-Webapplikasjoner/fullstaekk/CLAUDE.md`.
Kursmateriell siteres med leksjon og linje, og kopieres aldri inn i dette repoet.

## 1. Krav og sporbarhet

- [ ] Hver endret oppførsel kan knyttes til et krav (FK, TK, KK, DK) og et akseptansekriterium (AK).
- [ ] Ingen krav eller kriterier har falt ut i stillhet: det som er fjernet eller utsatt, står som det.
- [ ] Endringen holder seg innenfor MVP og «Ikke med»-listen i [kravspesifikasjonen](../krav/kravspesifikasjon.md).
- [ ] Kravspesifikasjon, [akseptansekriterier](../krav/akseptansekriterier.md), [wireframes](../design/wireframes/README.md)
      og [teknisk plan](../app/teknisk-plan.md) sier det samme.

## 2. Dokumentasjon

- [ ] Alle berørte dokumenter er oppdatert i samme PR, og [endringsloggen](../endringslogg.md) har en linje.
- [ ] Ingen motstrid mellom dokumentene; statuslinjer er daterte og stemmer.
- [ ] Nye filer ligger der [dokumentkartet](../README.md) sier; utdaterte er arkivert.

## 3. Struktur

- [ ] Kode som endres sammen, ligger sammen (etter funksjon, ikke teknisk lag).
- [ ] Én tydelig oppgave per fil; navn forklarer ansvar og følger eksisterende mønster.
- [ ] Ingen død kode, ubrukte importer, filer eller avhengigheter.

## 4. Overkomplisering

- [ ] Ingen lag, abstraksjoner, generiske hjelpere eller konfigurasjon uten et konkret behov nå.
- [ ] Hver ny avhengighet har en grunn som ikke kan løses enkelt med det vi har.
- [ ] Finnes det en enklere løsning som oppfyller kravet? Hvis ja, hvorfor ble den ikke valgt?
- [ ] Kan Max og Emil forklare hver linje uten KI? Kode de ikke kan forklare, er for kompleks.

## 5. Fullstækk og emnekrav

- [ ] Løsningen er sammenlignet med hvordan Fullstækk-kursene gjør det samme (kurs, leksjon, fil:linje).
- [ ] Avvik fra kurset er bevisste og begrunnet; ved konflikt mellom kurs og offisiell dokumentasjon er begge vist.
- [ ] [Emnekravene](../emne/emnekrav.md) T01–T08 er ivaretatt for det som er endret.

## 6. Sikkerhet og tilgang

- [ ] Sesjon og eierskap kontrolleres inne i skrivehandleren (T04), ikke bare i ruten eller klienten.
- [ ] Input valideres ved kjøring på serveren; TypeScript alene er ikke validering.
- [ ] Ingen hemmeligheter, passord, koder eller e-postadresser i kode, logger eller feilmeldinger.

## 7. Tester

- [ ] Testene kan feile: de ville fanget en reell feil i koden.
- [ ] Ulovlig skriving viser både avvisning og uendret database.
- [ ] Testnavn viser til AK-ID der det finnes et kriterium.
- [ ] `npm run check` er grønn, og dekningen går ikke ned uten grunn.

## 8. Feilhåndtering og logging

- [ ] Feil håndteres synlig for brukeren og havner i loggen med nok kontekst til feilsøking.
- [ ] Logger har nivå og forespørsels-ID der det finnes, og aldri persondata eller hemmeligheter.

## 9. Brukergrensesnitt

- [ ] Lesbar tekst, god kontrast, klikkflater på minst 44 px, synlig tastaturfokus og etiketter på felt.
- [ ] Fungerer på mobil og desktop slik wireframes viser; branch-bygget er prøvd lokalt.

## 10. Forståelse og valg

- [ ] Ikke-opplagte valg i endringen er begrunnet, og alternativet som ble valgt bort er nevnt.
- [ ] Reviewen ender med noen spørsmål studenten skal kunne svare på uten KI.

## Rapportformat

Hvert funn: alvorlighet (blokkerende, bør rettes, forslag), fil og linje, hva som er galt,
kilde (krav-ID, leksjon eller dokumentasjon) og minste retting. Skill funn fra smak.
Rett ingenting under reviewen; rettinger skjer etter godkjenning, i egen commit.
