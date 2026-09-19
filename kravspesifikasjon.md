# Kravspesifikasjon: deling og handel mellom studenter

> Arbeidsutkast, oppdatert 19.09.2026 etter Max' avklaringer. Dette er gjeldende produktbeskrivelse og krav, ikke dokumentasjon på en ferdig app. Behovet er ikke bekreftet gjennom brukerundersøkelser eller av hele gruppen.

Her samles målgruppe, MVP, funksjonelle krav, forretningsregler, tekniske rammer,
kvalitets- og designkrav og akseptansekriterier. Hvordan kravene skal implementeres
planlegges separat i [teknisk plan](docs/teknisk-plan.md). [README](README.md) er inngangen.

## 1. Problem og målgruppe

### Målgruppe

Den primære målgruppen er studenter som trenger bøker, fagutstyr eller andre ting, og studenter som eier ting de vil selge, låne ut eller leie ut. Tjenesten er ment å dekke både skoleutstyr og ting studenter trenger i hverdagen, for eksempel en skjerm eller PC. Første målgruppe kan avgrenses til studenter ved samme studiested eller i samme nærområde, slik at overlevering er praktisk mulig. Denne geografiske avgrensningen er et forslag som gruppen må vurdere.

### Problem

Studenter kan måtte skaffe bøker og annet utstyr til et emne eller en kortvarig oppgave. Å kjøpe noe nytt kan være dyrt når behovet bare varer en del av semesteret. Samtidig kan andre studenter sitte med ting de ikke lenger trenger etter å ha fullført et emne, eller som de ikke bruker for øyeblikket. Noen ting passer å selge videre, mens andre passer å låne eller leie ut for en periode.

Vi vil undersøke om studentene mangler en enkel måte å finne hverandre og avtale kjøp, gratis lån eller betalt leie. Ved lån og leie må de også vite hva som gjelder for perioden, overlevering og retur. Vi må undersøke om studentene faktisk opplever dette som et problem, hvordan de løser det i dag, og hva som eventuelt hindrer dem i å handle eller dele med hverandre.

### Foreslått løsning

Vi vil bygge en webapplikasjon der studenter kan legge ut og finne ting for salg, gratis utlån eller betalt utleie. Alle tre inngår i første versjon etter Max' avklaring. En interessert student sender en forespørsel med foreslåtte avtalevilkår. Eieren kan godta, avslå eller sende et motforslag som studenten kan godta eller avslå. Dette gjelder også salg; en kjøpsforespørsel blir ikke automatisk godtatt. Betaling skjer utenfor appen, og praktiske avtaler håndteres i forespørselen. Detaljer som ikke er avklart, står som åpne spørsmål nedenfor.

### Mulig verdi for brukerne

- Studenten som trenger en ting, kan kjøpe den brukt, låne den gratis eller leie den, avhengig av hva eieren tilbyr. Det kan koste mindre enn nykjøp når pris og tilgjengelighet gjør det mulig.
- Studenten som eier tingen, kan velge å selge den, dele den gratis eller få inntekt fra utleie.
- Gjenbruk kan redusere behovet for nye kjøp og dermed ressursbruk. Miljøgevinsten er en forventning vi ikke har målt.
- Tydelig informasjon om pris og overlevering, og om tidsrom og retur ved lån eller leie, kan gjøre det enklere å avtale med hverandre.

### Beslutningsoversikt

«Avklart» betyr avklart av Max 19.09.2026, ikke godkjent av Emil eller implementert.
Forslag er anbefalinger til gruppen; åpne valg må avklares før berørt funksjon bygges.

| Tema | Status | Beslutning eller neste avklaring |
|---|---|---|
| Omfang | Avklart | Salg, gratis lån og betalt leie i MVP. Chat senere og betaling utenfor appen. |
| Avtaleflyt | Avklart | Eier godtar, avslår eller justerer forespørselen; forespørrer godtar eller avslår motforslaget. Praktiske avtaler ligger i forespørselen, også ved salg. |
| Retur | Avklart | Eieren alene bekrefter mottatt retur og fullfører lån/leie. Studenten som lånte trenger ikke bekrefte. |
| Innlogging | Feide valgt bort av Max 19.09 | Dokumentundersøkelsen er utført; alternativ innlogging og verifisering av studentmålgruppen gjenstår. |
| Pris og felter | Åpent | Bestem obligatoriske annonse-/forespørselsfelt, leiepris per dag/per avtale, total og når kontaktopplysninger vises. Feltforslag finnes i punkt 3. |
| Tilgjengelighet | Delvis avklart | Ingen overlappende godtatte leieavtaler. Avklar resten i tilgjengelighetstabellen i punkt 3. |
| Avvik og avslutning | Åpent | Salgsfullføring, tilbaketrekking, avbestilling, uteblitt svar, skade og manglende retur. Vurder om dyrere ting trenger egne regler. |
| Forhandling | Åpent | Hvilke felt kan eieren justere, og trengs flere motforslagsrunder? |
| Historikk | Forslag | Bevar aksepterte vilkår og forslagshistorikk; avvis erstattede forslag. Annonseendringer skal ikke endre eksisterende avtaler. |
| Målgruppe og annonser | Åpent | Velg kategorier og geografisk område. Avklar flere handelstyper per annonse, offentlig visning og søkets omfang. |
| Hjelp/opplæring | Åpent, ikke vedtatt i MVP | Avklar om dette fortsatt hører til den langsiktige ideen. |

**Innlogging:** Max har valgt Feide bort etter undersøkelsen. Funn og begrensninger er
bevart i [teknisk plan](docs/teknisk-plan.md); ingen alternativ løsning er valgt.
Innlogging alene avgjør heller ikke studentstatus eller hvilke handlinger en bruker
får gjøre; målgruppeverifisering og eierskap til annonser og avtaler må håndteres separat.

**Begreper:** «Kjøp/salg» overfører eierskap. «Lån» gir midlertidig bruk gratis, mens «leie» gir midlertidig bruk mot betaling. Alle tre er del av prosjektideen etter Max' avklaring.

## 2. MVP og avgrensning (utkast)

Første versjon omfatter innlogging, søk og produktdetaljer, publisering for alle tre handelstyper, forespørsler, eierens svar/motforslag og studentens svar på motforslag. Ved lån og leie foreslår studenten en periode, for eksempel 21. september til 12. oktober. Ved salg foreslås en kjøpsavtale uten låneperiode. Henting og eventuell retur avtales gjennom forespørselen. Eieren bekrefter mottatt retur og fullfører lån/leie; salgsfullføring og de nøyaktige feltene er fortsatt åpne.

**Utenfor MVP:** chat og innebygd betaling. Varsler, vurderinger, depositum, konflikthåndtering og hjelp/opplæring er ikke vedtatt som MVP-funksjoner. Alle tre handelstyper er derimot inne i MVP; de er ikke utsatt til senere.

### Hele appen, utover MVP

Chat er ønsket etter MVP. Innebygd betaling, varsler, vurderinger, depositum og konfliktløsning kan vurderes senere. Om hjelp/opplæring fortsatt skal være del av den langsiktige ideen, er åpent.

## 3. Funksjonelle krav for MVP (første utkast)

Kravene nedenfor bygger på funksjonene Max har beskrevet og forslagene han har bedt om å ta med. Detaljer og akseptansekriterier må utarbeides sammen med gruppen.

| ID | Funksjonelt krav |
|---|---|
| FK-01 | En bruker skal kunne logge inn. Innloggingsløsning må velges; Feide er valgt bort. |
| FK-02 | En bruker skal kunne søke blant produkter, åpne et produkt og se beskrivelse, handelstype, pris eller at lånet er gratis, og relevant tilgjengelighet før en forespørsel sendes. |
| FK-03 | En innlogget bruker skal kunne legge ut et produkt for salg, gratis utlån eller betalt utleie. Om én annonse kan tilby flere typer samtidig, er åpent. |
| FK-04 | En innlogget bruker skal kunne sende en forespørsel om kjøp, gratis lån eller betalt leie, med foreslåtte vilkår og praktiske avtaler. Lån og leie inkluderer foreslått periode. |
| FK-05 | Eieren skal kunne se og godta, avslå eller foreslå justeringer til forespørsler om egne produkter. Et motforslag sendes til studenten som opprettet forespørselen. |
| FK-06 | Studenten som sendte forespørselen, skal kunne se eierens svar og godta eller avslå eierens motforslag. Begge parter skal kunne se hvilke vilkår det er enighet om. |
| FK-07 | Eieren skal kunne bekrefte mottatt retur for et avtalt lån eller leieforhold. Bekreftelsen fullfører avtalen og vises for begge parter, uten krav om bekreftelse fra studenten som lånte. Dette gjelder ikke fullføring av salg. |

### Informasjon per handelstype

Feltlisten nedenfor er et **forslag til obligatorisk avtaleinformasjon**, ikke et vedtatt
skjema. Perioden for lån/leie og praktiske avtaler i forespørselen er allerede avklart.
Gruppen må velge konkrete felt og valideringsregler før implementering.

| Opplysninger | Salg | Gratis lån | Betalt leie |
|---|---|---|---|
| Produkt, handelstype og de to partene | Ja | Ja | Ja |
| Pris | Avtalt total | Tydelig gratisstatus | Prisgrunnlag og avtalt total; beregning må avklares |
| Start og slutt | Ingen låneperiode | Fra-/til-dato | Fra-/til-dato |
| Overlevering | Foreslått sted og tidspunkt | Foreslått sted og tidspunkt | Foreslått sted og tidspunkt |
| Retur | Ikke relevant | Foreslått sted og tidspunkt | Foreslått sted og tidspunkt |

Påkrevde annonsefelt og kontaktopplysninger må avklares separat. Kontaktopplysninger
skal bare være tilgjengelige for partene (TK-07); tidspunktet for visning er åpent.

### Felles avtale- og motforslagsflyt

Dette er funksjonelle regler på tvers av handelstypene, ikke valgt databasearkitektur.

Statusnavnene er arbeidsbegreper. Tabellen angir hvem som kan utføre den avklarte
handlingen, fra hvilken tilstand og hva begge parter skal se etterpå.

| Før | Handling | Hvem? | Etter |
|---|---|---|---|
| Ingen forespørsel | Send forespørsel | Interessert student | Venter på eier; ingen avtale ennå. |
| Venter på eier | Godta opprinnelig forslag | Eier | Avtalt; de innsendte vilkårene vises for begge. |
| Venter på eier | Avslå opprinnelig forslag | Eier | Avslått; ingen avtale opprettes. |
| Venter på eier | Send justerte vilkår | Eier | Venter på forespørrer; endringene er ikke akseptert ennå. |
| Venter på forespørrer | Godta motforslag | Studenten som sendte forespørselen | Avtalt med de justerte vilkårene. |
| Venter på forespørrer | Avslå motforslag | Studenten som sendte forespørselen | Avslått; ingen avtale om motforslaget. Videre forhandling er åpent. |
| Avtalt lån/leie, ikke fullført | Bekreft mottatt retur | Eier | Fullført; ingen bekreftelse fra forespørrer kreves. |

Om det trengs en egen status for utlevert vare, er åpent. Bekreftelse av retur registrerer
eierens opplysning om mottak; appen kan ikke kontrollere den fysiske overleveringen.
Fullføring av salg, avbestilling og gjenåpning er ikke definert av denne tabellen.

Eksempel: Studenten foreslår lån 21. september–12. oktober. Eieren foreslår i stedet
23. september–10. oktober. Først når studenten godtar motforslaget, er de enige om den
nye perioden. Samme svarflyt gjelder ved salg, men uten krav om tilbakelevering.

«Avtale» her beskriver appens registrerte enighet; særskilt e-signering er ikke spesifisert.
Historikk og vern mot aksept av erstattede forslag er anbefalinger i beslutningsoversikten.

### Tilgjengelighet og reservering

Avtalestatus og annonsens tilgjengelighet er forskjellige ting. En fullført retur skal
ikke automatisk slette andre fremtidige avtaler eller erklære alle datoer ledige.

| Regel | Status og avgrensning |
|---|---|
| Overlappende godtatte leieavtaler | Avklart: samme ting kan ikke ha to i samme periode, også ved samtidige svar (TK-06). |
| Når reserveres tingen? | Forslag: først når partene har akseptert samme vilkår, med ny tilgjengelighetskontroll også ved aksept av motforslag. Ikke besluttet. |
| Flere ventende forespørsler | Forslag: tillat overlapp før avtale inngås. Avklar hva som skjer med de øvrige når én godtas. |
| Gratis lån, dobbeltsalg og blandede handelstyper | Forslag: hindre motstridende avtaler for samme ting. Avklar reglene før implementering. |
| Datogrenser og ny tilgjengelighet | Åpent: dato eller klokkeslett, inklusive sluttdatoer, retur samme dag som neste henting, forsinket retur og tilgjengelighet etter fullføring/avbestilling. |

## 4. Tekniske krav og teknologivalg (utkast)

Tekniske krav beskriver egenskaper løsningen må ha. Teknologivalg beskriver hvilke verktøy vi bruker for å oppfylle kravene. En bestemt stack hører hjemme som et teknisk rammevilkår dersom emnet krever den, eller som et begrunnet valg dersom gruppen kan velge selv.

| ID | Status | Teknisk krav |
|---|---|---|
| TK-01 | Innlogging kreves; løsning åpen | Feide er valgt bort av Max. Alternativ innlogging og studentverifisering må avklares. Appen skal kontrollere brukerens innloggede økt på serveren før beskyttede handlinger utføres. |
| TK-02 | Innspill fra Max | Appen skal lagre produkter, eiere, forespørsler, motforslag og avtalestatus for alle tre handelstyper, slik at informasjonen finnes igjen etter utlogging. |
| TK-03 | Valgt av Max, presisert for motforslag og retur | Bare eieren kan endre eget produkt og godta, avslå eller justere studentens opprinnelige forespørsel. Bare studenten som sendte forespørselen kan godta eller avslå eierens motforslag. Bare eieren kan bekrefte mottatt retur og fullføre lån/leie. Hver handling skal kontrollere part, rolle og gyldig avtalestatus på serveren. |
| TK-04 | Valgt av Max | Serveren skal kontrollere data fra brukeren før lagring, for eksempel at nødvendig produktinformasjon finnes og at en leieperiode er gyldig. |
| TK-05 | Valgt av Max for leie; utvidet beskrivelse for MVP | Avtalestatus skal gjelde en konkret forespørsel og avtale. Lån og leie har en periode; salg har ingen returperiode. Den nøyaktige datamodellen bestemmes senere. |
| TK-06 | Valgt av Max for leie; generalisering til lån er forslag | Appen skal hindre to godtatte leieavtaler for samme produkt i overlappende perioder, også ved samtidige svar. Forslag: samme vern for gratis lån. Vern mot dobbeltsalg og konflikt mellom salg og fremtidige lån/leier må avklares før implementering. |
| TK-07 | Valgt av Max | Bare eieren og studenten som sendte forespørselen skal kunne se forespørselen, motforslag og eventuelle kontaktopplysninger. Tilgangen skal kontrolleres på serveren. |

**Tekniske rammer:** Appen skal oppfylle [emnekrav](docs/emnekrav.md) T01–T08. Valg av stack, datamodell, API og drift beskrives i [teknisk plan](docs/teknisk-plan.md). Ingen endelig stack er valgt. TK-ID-ene beholdes for sporbarhet, selv om flere av reglene også er funksjonelle sikkerhets- og domenekrav.

## 5. Kvalitetskrav (første utkast)

Kvalitetskrav beskriver hvordan appen skal oppleves og fungere når de funksjonelle kravene brukes. Konkrete måltall og testoppsett fastsettes når vi skriver akseptansekriterier.

| ID | Kvalitetskrav |
|---|---|
| KK-01 | Appen skal være enkel å bruke på mobil. En student skal kunne søke, åpne et produkt, legge ut et produkt og sende en forespørsel på en vanlig mobilskjerm uten at nødvendig innhold eller knapper blir utilgjengelige. |
| KK-02 | Søk blant produkter skal gi svar raskt nok til at brukeren kan finne aktuelle annonser uten unødig venting. En konkret responstidsgrense og datamengde må bestemmes før kravet kan testes. |
| KK-03 | Hvis en forespørsel ikke kan sendes, skal brukeren få en tydelig forklaring og kunne prøve igjen uten å måtte fylle inn alt på nytt. Appen skal ikke vise forespørselen som sendt før den er lagret. |
| KK-04 | Viktige oppgaver skal kunne utføres med tastatur, og tekst og knapper skal være lesbare med god kontrast og ved høy zoom. Sidene skal bruke semantisk HTML og riktige elementer for innhold, navigasjon, skjemaer og knapper. Dette støtter både tilgjengelighet og at søkemotorer kan forstå eventuelle offentlige sider. |
| KK-05 | Når en annonse eller forespørsel lagres, skal appen vise riktig resultat og status. Hvis lagring feiler, skal brukeren få beskjed, og appen skal ikke vise handlingen som fullført. |

Om produktannonser skal være offentlig tilgjengelige og kunne vises i søkemotorer, må avklares før vi skriver mer konkrete SEO-krav. Private forespørsler og kontaktopplysninger skal uansett ikke gjøres offentlige for søkemotorer.

## 6. Designkrav (første utkast)

Grensesnittet skal oppleves moderne, enkelt, profesjonelt og elegant. I praksis betyr det at de viktigste oppgavene er lette å finne, at informasjonen har tydelig hierarki, og at farger, typografi, avstander og komponenter brukes konsekvent. Vi vurderer dette med skisser og brukerprøving, ikke bare ut fra en stilbeskrivelse.

| ID | Designkrav |
|---|---|
| DK-01 | Brukeren skal enkelt finne søk, produktdetaljer, publisering av produkt og egne forespørsler gjennom tydelig og konsekvent navigasjon. |
| DK-02 | Produktvisningen skal gjøre de viktigste opplysningene lette å se: hva tingen er, pris, tilgjengelighet og hvordan man sender en forespørsel. |
| DK-03 | Designet skal ha god kontrast, lesbar tekst, tydelige knapper og synlig tastaturfokus. Det skal ikke være nødvendig å forstå informasjon bare ut fra farge. |
| DK-04 | Designet skal være responsivt. De samme kjerneoppgavene skal kunne gjennomføres på mobil, nettbrett og PC uten at viktig innhold eller handlinger forsvinner. Layouten kan tilpasses skjermstørrelsen. |

Ønsket om Tailwind CSS er flyttet til [teknisk plan](docs/teknisk-plan.md); designkravene over beskriver brukeropplevelsen uavhengig av verktøy.

## 7. Akseptansekriterier for MVP (første utkast)

Kriteriene beskriver observerbar oppførsel med **Gitt / Når / Så**. De er forslag til gjennomgang med gruppen, ikke bevis for at appen er bygget eller testet. Krav-ID-ene viser til tabellene over.

### Innlogging og tilgang (FK-01, TK-01, TK-03, TK-07)

- **AK-01:** Gitt at valgt innloggingsløsning er konfigurert og studenten har en gyldig konto med tilgang, når studenten fullfører innloggingen, så skal appen opprette en gyldig økt og gi tilgang til funksjoner for innloggede brukere. Konkret testoppsett avventer valg av løsning og målgruppeverifisering.
- **AK-02:** Gitt at en bruker ikke er logget inn, når brukeren prøver en beskyttet handling (publisere, sende forespørsel, svare eller bekrefte retur), så skal handlingen avvises uten at data lagres, og brukeren skal få beskjed om å logge inn. Prøves separat for hver handling.
- **AK-03:** Gitt at en innlogget bruker ikke er part i en forespørsel, når brukeren forsøker å åpne den direkte, så skal forespørselen, eventuelle motforslag og kontaktopplysninger ikke vises.

### Søk og produktdetaljer (FK-02, KK-02)

- **AK-04:** Gitt at det finnes en tilgjengelig annonse med et bestemt produktnavn, når brukeren søker etter navnet, så skal annonsen vises i søkeresultatet.
- **AK-05:** Gitt at et søk ikke finner noen produkter, når resultatet vises, så skal brukeren få en tydelig melding om at ingen annonser ble funnet.
- **AK-06:** Gitt at en bruker åpner et produkt fra søkeresultatet, når produktsiden vises, så skal brukeren kunne se beskrivelse, handelstype, pris eller gratisstatus og tilgjengelighet før en forespørsel sendes.

### Legge ut produkt (FK-03, TK-02, TK-04, KK-05)

- **AK-07:** Gitt at en student er logget inn og har fylt inn de påkrevde opplysningene om et produkt, når studenten publiserer annonsen, så skal den lagres med studenten som eier og kunne finnes igjen etter ny innlogging.
- **AK-08:** Gitt at påkrevde opplysninger mangler eller er ugyldige, når studenten prøver å publisere, så skal annonsen ikke lagres og studenten skal få vite hva som må rettes.
- **AK-09:** Gitt at lagringen feiler, når studenten prøver å publisere, så skal appen ikke vise annonsen som publisert og studenten skal få en tydelig feilmelding.

### Forespørsel og svar (FK-04–FK-06, TK-02–TK-07, KK-03)

- **AK-10:** Gitt at en student er logget inn og produktet tilbys for valgt handelstype, når studenten sender en gyldig kjøps-, låne- eller leieforespørsel med praktiske avtaler og periode der det gjelder, så skal den lagres som ventende og være synlig for studenten og eieren. Den er ennå ikke en godtatt avtale.
- **AK-11:** Gitt at perioden er ugyldig, når studenten prøver å sende forespørselen, så skal den ikke lagres og studenten skal få en forklaring uten å miste opplysningene som kan brukes på nytt.
- **AK-12:** Gitt en gyldig forespørsel som venter på eieren og kan godtas etter tilgjengelighetsreglene, når eieren godtar den, så skal begge parter se en lagret avtale med de opprinnelige vilkårene.
- **AK-24:** Gitt en forespørsel som venter på eieren, når eieren avslår den, så skal begge se avslaget uten at en avtale opprettes.
- **AK-13:** Gitt at en bruker ikke er eieren, når brukeren prøver å godta, avslå eller justere den opprinnelige forespørselen som eier, så skal serveren avvise handlingen uten endring. Dette hindrer ikke at den opprinnelige studenten svarer på et motforslag i sin egen rolle.
- **AK-14:** Gitt at én leieforespørsel allerede er godtatt for en periode, når eieren prøver å godta en annen forespørsel om samme produkt i en overlappende periode, så skal den andre godkjenningen avvises og den første avtalen forbli uendret.
- **AK-15:** Gitt at lagringen av en forespørsel eller et svar feiler, når brukeren utfører handlingen, så skal appen ikke vise den som fullført, og brukeren skal få en tydelig feilmelding.

### Bruk på ulike enheter og tilgjengelighet (KK-01, KK-04, DK-03–DK-04)

- **AK-16:** Gitt en mobil, et nettbrett eller en PC, når brukeren utfører en kjerneoppgave, så skal alle nødvendige felt og handlinger være tilgjengelige uten at innhold skjules av layouten. Prøves separat for søk, produktvisning, publisering, forespørsel, svar, motforslag og returbekreftelse.
- **AK-17:** Gitt at brukeren navigerer med tastatur eller høy zoom, når brukeren utfører kjerneoppgavene, så skal fokus være synlig og alle nødvendige kontroller kunne nås og brukes. Sider og skjemaer skal bruke passende HTML-elementer og tilknyttede feltetiketter.

### Motforslag og alle tre handelstyper (FK-03–FK-06, TK-03, TK-07)

- **AK-18:** Gitt en ventende forespørsel, når eieren sender justerte vilkår, så skal studenten kunne se endringene og godta eller avslå dem. Justeringen alene oppretter ingen godtatt avtale.
- **AK-19:** Gitt et gjeldende motforslag fra eieren som kan godtas etter tilgjengelighetsreglene, når studenten som opprettet forespørselen godtar det, så skal begge se en lagret avtale med de justerte vilkårene.
- **AK-25:** Gitt et gjeldende motforslag fra eieren, når studenten som opprettet forespørselen avslår det, så skal begge se avslaget uten at motforslaget blir en avtale.
- **AK-20:** Gitt en utenforstående eller eieren selv, når vedkommende prøver å godta motforslaget på vegne av studenten, så skal serveren avvise handlingen uten å endre avtalen.
- **AK-21:** Gitt at et produkt tilbys for salg, når en student sender en kjøpsforespørsel, så må selgeren svare. Salgsforespørselen støtter samme aksept-, avslags- og motforslagsflyt, uten krav om tilbakeleveringsperiode.
- **AK-22:** Gitt at et produkt tilbys til gratis lån, når studenten foreslår en låneperiode, så skal forespørselen vise at lånet er gratis og støtte samme svarflyt. Den skal ikke kreve en leiepris.
- **AK-23:** Gitt at eieren publiserer én annonse for hver av salg, gratis lån og betalt leie, når en student åpner dem, så skal hver annonses handelstype og pris eller gratisstatus være synlig. Alle tre typer skal kunne brukes i første versjon.

### Retur og fullføring (FK-07, TK-02–TK-03, KK-05)

- **AK-26:** Gitt et avtalt lån eller leieforhold som ikke er fullført, når eieren bekrefter mottatt retur, så skal avtalen lagres som fullført og vises slik for begge etter ny innlogging, uten at forespørreren bekrefter.
- **AK-27:** Gitt at en innlogget bruker ikke er eieren, når brukeren forsøker å bekrefte retur, så skal serveren avvise handlingen uten å endre avtalen. Prøves både med forespørreren og en utenforstående.
- **AK-28:** Gitt at lagring av returbekreftelsen feiler, når eieren bekrefter, så skal appen vise feil uten å vise avtalen som fullført.
- **AK-29:** Gitt en forespørsel som ikke er godtatt, når eieren forsøker å bekrefte retur, så skal serveren avvise handlingen uten å endre status.

Eksisterende AK-ID-er beholdes; nye kriterier er plassert ved den relevante flyten.
AK-02–AK-03, AK-07–AK-09, AK-12–AK-13, AK-15–AK-20 og AK-24–AK-25 skal prøves for
alle tre handelstyper der handlingen gjelder. Returkriteriene gjelder bare lån/leie.

**Før endelig godkjenning:** avklar åpne valg i beslutningsoversikten og tilgjengelighetstabellen,
og sett et målbart søktidskrav. Valgt innlogging må prøves med relevante brukere. Tekniske testscenarier
planlegges separat. Kriteriene er fortsatt utkast, ikke ferdige eller beståtte tester.

## Behov som bør undersøkes

Snakk med noen studenter som nylig har skaffet utstyr til et emne, og noen som har ting liggende. Spør hva de trengte, hvordan de løste det, hva det kostet, om de ville kjøpt brukt, lånt eller leid av en medstudent, og hva som ville gjort dem trygge nok til å gjøre det. Noter konkrete svar og motforestillinger før vi bestemmer MVP og skriver detaljerte krav.

## Neste dokumentasjonssteg

Neste steg er å avklare de åpne avtale- og tilgjengelighetsreglene, gå gjennom kriteriene med Emil og prøve hovedflyten mot studentbehov. Deretter fylles [teknisk plan](docs/teknisk-plan.md) og prioritering i [TODO.md](TODO.md). Funksjonelle krav, kvalitetskrav, designkrav og kriterier beholdes samlet her; eventuell senere oppdeling skjer per større funksjon.
