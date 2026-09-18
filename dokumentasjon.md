# Dokumentasjon: deling og handel mellom studenter

> Arbeidsutkast, 18.09.2026. Dette dokumentet samler gruppens idé og spørsmål som må avklares. Beskrivelsen bygger foreløpig på innspill fra Max; behovet er ikke bekreftet gjennom brukerundersøkelser eller av hele gruppen.

## 1. Problem og målgruppe

### Målgruppe

Den primære målgruppen er studenter som trenger bøker, fagutstyr eller andre ting, og studenter som eier ting de vil selge, låne ut eller leie ut. Tjenesten er ment å dekke både skoleutstyr og ting studenter trenger i hverdagen, for eksempel en skjerm eller PC. Første målgruppe kan avgrenses til studenter ved samme studiested eller i samme nærområde, slik at overlevering er praktisk mulig. Denne geografiske avgrensningen er et forslag som gruppen må vurdere.

### Problem

Studenter kan måtte skaffe bøker og annet utstyr til et emne eller en kortvarig oppgave. Å kjøpe noe nytt kan være dyrt når behovet bare varer en del av semesteret. Samtidig kan andre studenter sitte med ting de ikke lenger trenger etter å ha fullført et emne, eller som de ikke bruker for øyeblikket. Noen ting passer å selge videre, mens andre passer å låne eller leie ut for en periode.

Vi vil undersøke om studentene mangler en enkel måte å finne hverandre og avtale kjøp, gratis lån eller betalt leie. Ved lån og leie må de også vite hva som gjelder for perioden, overlevering og retur. Vi må undersøke om studentene faktisk opplever dette som et problem, hvordan de løser det i dag, og hva som eventuelt hindrer dem i å handle eller dele med hverandre.

### Foreslått løsning

Vi vil utforske en webapplikasjon der studenter kan legge ut og finne ting. Eieren skal kunne tilby en ting for salg, gratis utlån eller betalt utleie. En interessert student skal kunne ta kontakt og avtale kjøp eller sende en forespørsel om lån eller leie for en bestemt periode. Hvordan en eventuell betaling gjennomføres, er ennå ikke bestemt. Dette beskriver retningen, ikke et vedtatt funksjonsomfang eller en ferdig kravspesifikasjon.

### Mulig verdi for brukerne

- Studenten som trenger en ting, kan kjøpe den brukt, låne den gratis eller leie den, avhengig av hva eieren tilbyr. Det kan koste mindre enn nykjøp når pris og tilgjengelighet gjør det mulig.
- Studenten som eier tingen, kan velge å selge den, dele den gratis eller få inntekt fra utleie.
- Gjenbruk kan redusere behovet for nye kjøp og dermed ressursbruk. Miljøgevinsten er en forventning vi ikke har målt.
- Tydelig informasjon om pris og overlevering, og om tidsrom og retur ved lån eller leie, kan gjøre det enklere å avtale med hverandre.

## Spørsmål vi må avklare

1. Når betaling ikke skjer i appen, skal den vise en avtalt pris og markere oppgjør som noe partene ordner selv? Hvordan angis salgspris og leiepris, for eksempel per dag eller per avtale?
2. Hvilke kategorier bør være med i første versjon? Skoleutstyr og hverdagsting er begge innenfor idéen, men første utvalg er ikke bestemt.
3. Skal første versjon være for ett studiested, én by eller et større studentmiljø?
4. Hvordan skal studentene finne og overlevere ting? Må de være på samme campus, og trenger de kontakt/chat i appen?
5. Hva skal skje hvis en ting ikke blir levert tilbake, blir skadet eller eieren avlyser? Trenger dyrere ting som PC egne regler?
6. Er hjelp/opplæring mellom studenter fortsatt en del av prosjektideen, eller skal vi konsentrere oss om fysiske ting først?
7. Skal én annonse kunne tilby flere valg samtidig, for eksempel både salg og utleie, eller velger eieren én type per annonse?

## Prosjektretning og åpne valg

Innspill fra Max: Hele appideen omfatter kjøp/salg, gratis lån og betalt utleie. Innlogging med Feide er ønsket. En innebygd betalingsløsning, som kortbetaling i appen, trengs ikke i første versjon. Det er åpent om kontakt mellom partene krever meldinger eller chat i appen.

**Feide som ønsket innlogging:** Feide kan gi innlogging via studentens institusjon. [Feides dokumentasjon](https://docs.feide.no/service_providers/getting_started/openid_connect.html) beskriver registrering av en OIDC-applikasjon i kundeportalen. Før vi låser teknisk løsning må vi undersøke om gruppen kan registrere tjenesten, få nødvendige tilganger og prøve innlogging med relevante testbrukere. Innloggingen alene avgjør heller ikke hvilke handlinger en bruker får gjøre i appen; eierskap til annonser og avtaler må kontrolleres separat.

**Begreper:** «Kjøp/salg» overfører eierskap. «Lån» gir midlertidig bruk gratis, mens «leie» gir midlertidig bruk mot betaling. Alle tre er del av prosjektideen etter Max' avklaring.

## 2. MVP og avgrensning (utkast)

MVP-utkastet har seks funksjoner: en bruker skal kunne logge inn, søke blant produkter og se produktdetaljer, legge ut et produkt, sende en forespørsel om å leie, og få svar fra eieren. Hvordan partene avtaler overlevering og hvordan en leieperiode avsluttes, er ennå ikke bestemt.

Kjøp/salg og gratis lån er del av hele appideen, men er foreløpig ikke tatt inn blant de seks MVP-kravene. Innebygd betaling er ikke planlagt i MVP. Chat, varsler, vurderinger, depositum og konflikthåndtering er ikke besluttet som MVP-funksjoner.

### Hele appen, utover MVP

Prosjektideen omfatter et studentmarked for kjøp, salg, gratis lån og betalt utleie av både skoleutstyr og hverdagsting. Mer detaljert funksjonalitet for betaling, chat, varsler, tillit og konfliktløsning kan vurderes senere. Dette er muligheter, ikke vedtatte krav.

## 3. Funksjonelle krav for MVP (første utkast)

Kravene nedenfor bygger på funksjonene Max har beskrevet og forslagene han har bedt om å ta med. Detaljer og akseptansekriterier må utarbeides sammen med gruppen.

| ID | Funksjonelt krav |
|---|---|
| FK-01 | En bruker skal kunne logge inn. Feide er ønsket innloggingsmåte. |
| FK-02 | En bruker skal kunne søke blant produkter som er lagt ut, åpne et produkt og se beskrivelse, pris og tilgjengelighet før en forespørsel sendes. |
| FK-03 | En innlogget bruker skal kunne legge ut et produkt. |
| FK-04 | En innlogget bruker skal kunne sende en forespørsel om å leie et produkt. |
| FK-05 | Eieren skal kunne se og godta eller avslå forespørsler om egne produkter. |
| FK-06 | Brukeren som sendte forespørselen, skal kunne se om den ble godtatt eller avslått. |

**Å avklare før kravene kan testes:** Hva må en annonse inneholde? Hvilke felt skal søket bruke? Hva skal en leieforespørsel inneholde? Hvordan avtales overlevering? Dette er spørsmål, ikke nye vedtatte MVP-krav.

## 4. Tekniske krav og teknologivalg (utkast)

Tekniske krav beskriver egenskaper løsningen må ha. Teknologivalg beskriver hvilke verktøy vi bruker for å oppfylle kravene. En bestemt stack hører hjemme som et teknisk rammevilkår dersom emnet krever den, eller som et begrunnet valg dersom gruppen kan velge selv.

| ID | Status | Teknisk krav |
|---|---|---|
| TK-01 | Innspill fra Max | Innloggingen skal bruke Feide. Appen skal kontrollere brukerens innloggede økt på serveren før beskyttede handlinger utføres. Feide-tilgang må undersøkes før løsningen låses. |
| TK-02 | Innspill fra Max | Appen skal lagre produkter, hvem som har lagt dem ut, leieforespørsler og status for utleie i en database, slik at informasjonen finnes igjen etter at brukeren logger ut. |
| TK-03 | Valgt av Max | Serveren skal kontrollere at bare eieren kan endre sitt produkt eller svare på forespørsler om det. Innlogging alene er ikke nok til å gi tilgang til andres data. |
| TK-04 | Valgt av Max | Serveren skal kontrollere data fra brukeren før lagring, for eksempel at nødvendig produktinformasjon finnes og at en leieperiode er gyldig. |
| TK-05 | Valgt av Max | Leiestatus skal knyttes til en konkret avtale og periode, ikke bare lagres som et ja/nei-felt på produktet. Da kan appen skille mellom ledig, forespurt og utleid og håndtere flere forespørsler tydelig. Den nøyaktige modellen bestemmes senere. |
| TK-06 | Valgt av Max | Appen skal hindre at to leieforespørsler for samme produkt blir godtatt for overlappende perioder. Kontroll må skje når forespørselen godtas, også hvis flere svar behandles samtidig. |
| TK-07 | Valgt av Max | Bare eieren og brukeren som sendte en forespørsel, skal kunne se forespørselen og eventuelle kontaktopplysninger knyttet til den. Tilgangen skal kontrolleres på serveren. |

**Stack og språk:** Emnets rammer er samlet i [emnekrav](docs/emnekrav.md), særlig T01–T08. React, TypeScript, rammeverk, database og drift kan beskrives her når gruppen har valgt dem. Et eksempel på et senere teknologivalg er «vi bruker RedwoodSDK med TypeScript», mens kravet er at appen følger emnets tillatte stack og oppfyller innlogging, datalagring og hovedflyt. Ingen endelig stack er valgt i dette dokumentet.

## 5. Kvalitetskrav (første utkast)

Kvalitetskrav beskriver hvordan appen skal oppleves og fungere når de funksjonelle kravene brukes. Konkrete måltall og testoppsett fastsettes når vi skriver akseptansekriterier.

| ID | Kvalitetskrav |
|---|---|
| KK-01 | Appen skal være enkel å bruke på mobil. En student skal kunne søke, åpne et produkt, legge ut et produkt og sende en leieforespørsel på en vanlig mobilskjerm uten at nødvendig innhold eller knapper blir utilgjengelige. |
| KK-02 | Søk blant produkter skal gi svar raskt nok til at brukeren kan finne aktuelle annonser uten unødig venting. En konkret responstidsgrense og datamengde må bestemmes før kravet kan testes. |
| KK-03 | Hvis en leieforespørsel ikke kan sendes, skal brukeren få en tydelig forklaring og kunne prøve igjen uten å måtte fylle inn alt på nytt. Appen skal ikke vise forespørselen som sendt før den er lagret. |
| KK-04 | Viktige oppgaver skal kunne utføres med tastatur, og tekst og knapper skal være lesbare med god kontrast og ved høy zoom. Sidene skal bruke semantisk HTML og riktige elementer for innhold, navigasjon, skjemaer og knapper. Dette støtter både tilgjengelighet og at søkemotorer kan forstå eventuelle offentlige sider. |
| KK-05 | Når en annonse eller forespørsel lagres, skal appen vise riktig resultat og status. Hvis lagring feiler, skal brukeren få beskjed, og appen skal ikke vise handlingen som fullført. |

Om produktannonser skal være offentlig tilgjengelige og kunne vises i søkemotorer, må avklares før vi skriver mer konkrete SEO-krav. Private forespørsler og kontaktopplysninger skal uansett ikke gjøres offentlige for søkemotorer.

## 6. Designkrav (første utkast)

Grensesnittet skal oppleves moderne, enkelt, profesjonelt og elegant. I praksis betyr det at de viktigste oppgavene er lette å finne, at informasjonen har tydelig hierarki, og at farger, typografi, avstander og komponenter brukes konsekvent. Vi vurderer dette med skisser og brukerprøving, ikke bare ut fra en stilbeskrivelse.

| ID | Designkrav |
|---|---|
| DK-01 | Brukeren skal enkelt finne søk, produktdetaljer, publisering av produkt og egne leieforespørsler gjennom tydelig og konsekvent navigasjon. |
| DK-02 | Produktvisningen skal gjøre de viktigste opplysningene lette å se: hva tingen er, pris, tilgjengelighet og hvordan man sender en forespørsel. |
| DK-03 | Designet skal ha god kontrast, lesbar tekst, tydelige knapper og synlig tastaturfokus. Det skal ikke være nødvendig å forstå informasjon bare ut fra farge. |
| DK-04 | Designet skal være responsivt. De samme kjerneoppgavene skal kunne gjennomføres på mobil, nettbrett og PC uten at viktig innhold eller handlinger forsvinner. Layouten kan tilpasses skjermstørrelsen. |

**Stylingverktøy:** Max ønsker å bruke moderne pakker, for eksempel Tailwind CSS. Det er et ønsket teknologivalg for implementeringen, ikke i seg selv et krav til hvordan grensesnittet fungerer. Endelig valg tas sammen med appens stack.

## 7. Akseptansekriterier for MVP (første utkast)

Kriteriene beskriver observerbar oppførsel med **Gitt / Når / Så**. De er forslag til gjennomgang med gruppen, ikke bevis for at appen er bygget eller testet. Krav-ID-ene viser til tabellene over.

### Innlogging og tilgang (FK-01, TK-01, TK-03, TK-07)

- **AK-01:** Gitt at en student har en Feide-bruker som tjenesten har tilgang til, når studenten fullfører innloggingen, så skal appen opprette en gyldig økt og gi tilgang til funksjoner for innloggede brukere.
- **AK-02:** Gitt at en bruker ikke er logget inn, når brukeren prøver å legge ut et produkt eller sende en leieforespørsel, så skal handlingen avvises uten at data lagres, og brukeren skal få beskjed om å logge inn.
- **AK-03:** Gitt at en innlogget bruker ikke er part i en leieforespørsel, når brukeren forsøker å åpne den direkte, så skal forespørselen og eventuelle kontaktopplysninger ikke vises.

### Søk og produktdetaljer (FK-02, KK-02)

- **AK-04:** Gitt at det finnes en tilgjengelig annonse med et bestemt produktnavn, når brukeren søker etter navnet, så skal annonsen vises i søkeresultatet.
- **AK-05:** Gitt at et søk ikke finner noen produkter, når resultatet vises, så skal brukeren få en tydelig melding om at ingen annonser ble funnet.
- **AK-06:** Gitt at en bruker åpner et produkt fra søkeresultatet, når produktsiden vises, så skal brukeren kunne se beskrivelse, pris og tilgjengelighet før en forespørsel sendes.

### Legge ut produkt (FK-03, TK-02, TK-04, KK-05)

- **AK-07:** Gitt at en student er logget inn og har fylt inn de påkrevde opplysningene om et produkt, når studenten publiserer annonsen, så skal den lagres med studenten som eier og kunne finnes igjen etter ny innlogging.
- **AK-08:** Gitt at påkrevde opplysninger mangler eller er ugyldige, når studenten prøver å publisere, så skal annonsen ikke lagres og studenten skal få vite hva som må rettes.
- **AK-09:** Gitt at lagringen feiler, når studenten prøver å publisere, så skal appen ikke vise annonsen som publisert og studenten skal få en tydelig feilmelding.

### Leieforespørsel og svar (FK-04–FK-06, TK-02, TK-04, TK-06, KK-03)

- **AK-10:** Gitt at en student er logget inn og produktet kan leies i den ønskede perioden, når studenten sender en gyldig forespørsel, så skal den lagres som ventende og være synlig for studenten og eieren.
- **AK-11:** Gitt at perioden er ugyldig, når studenten prøver å sende forespørselen, så skal den ikke lagres og studenten skal få en forklaring uten å miste opplysningene som kan brukes på nytt.
- **AK-12:** Gitt at eieren har en ventende forespørsel om sitt produkt, når eieren godtar eller avslår den, så skal beslutningen lagres og være synlig for studenten som sendte forespørselen.
- **AK-13:** Gitt at en annen bruker enn eieren prøver å svare på forespørselen, når handlingen sendes til serveren, så skal den avvises og forespørselens status forbli uendret.
- **AK-14:** Gitt at én leieforespørsel allerede er godtatt for en periode, når eieren prøver å godta en annen forespørsel om samme produkt i en overlappende periode, så skal den andre godkjenningen avvises og den første avtalen forbli uendret.
- **AK-15:** Gitt at lagringen av en forespørsel eller et svar feiler, når brukeren utfører handlingen, så skal appen ikke vise den som fullført, og brukeren skal få en tydelig feilmelding.

### Bruk på ulike enheter og tilgjengelighet (KK-01, KK-04, DK-03–DK-04)

- **AK-16:** Gitt en mobil, et nettbrett eller en PC, når brukeren søker, åpner et produkt, legger ut et produkt eller sender en forespørsel, så skal alle nødvendige felt og handlinger være tilgjengelige uten at innhold skjules av layouten.
- **AK-17:** Gitt at brukeren navigerer med tastatur eller høy zoom, når brukeren utfører kjerneoppgavene, så skal fokus være synlig og alle nødvendige kontroller kunne nås og brukes. Sider og skjemaer skal bruke passende HTML-elementer og tilknyttede feltetiketter.

**Må presiseres før endelig godkjenning:** påkrevde annonsefelt, hvordan pris og tilgjengelighet angis, hva som er en gyldig leieperiode, hvilke produkter som vises i søk, og et målbart søktidskrav. Feide-oppsettet må også prøves med reelle eller godkjente testbrukere. Kriteriene dekker foreløpig MVP-utkastets leieflyt; kjøp/salg og gratis lån får egne kriterier når de tas inn i en leveranse.

## Behov som bør undersøkes

Snakk med noen studenter som nylig har skaffet utstyr til et emne, og noen som har ting liggende. Spør hva de trengte, hvordan de løste det, hva det kostet, om de ville kjøpt brukt, lånt eller leid av en medstudent, og hva som ville gjort dem trygge nok til å gjøre det. Noter konkrete svar og motforestillinger før vi bestemmer MVP og skriver detaljerte krav.

## Neste dokumentasjonssteg

Neste steg er å gå gjennom akseptansekriteriene sammen, avklare felter og regler for leieperioder og prøve hovedflyten mot faktiske studentbehov. Deretter kan vi skrive forretningsregler og prioritering i tråd med [TODO.md](TODO.md).
