# Akseptansekriterier for MVP

Utskilt fra [kravspesifikasjonen](kravspesifikasjon.md) 05.10.2026 uten innholdsendring.
Kravene (FK, TK, KK, DK) som kriteriene viser til, står der.

Kriteriene beskriver observerbar oppførsel med **Gitt / Når / Så**. De er forslag til gjennomgang med gruppen, ikke bevis for at appen er bygget eller testet. Eksisterende AK-ID-er er beholdt; nye kriterier har nye nummer.

## Innlogging og tilgang (FK-01, TK-01, TK-03, TK-07)

- **AK-01:** Gitt en gyldig `@hiof.no`-adresse, når brukeren skriver inn riktig engangskode, så skal appen opprette en gyldig økt. En ny bruker sendes til kontooppsett.
- **AK-30:** Gitt en adresse som ikke slutter på `@hiof.no`, når brukeren prøver å logge inn, så skal appen avvise den uten å sende kode, og vise hva som er feil.
- **AK-02:** Gitt at en bruker ikke er logget inn, når brukeren prøver å se annonser eller utføre en beskyttet handling, så skal forespørselen avvises uten at data lagres eller vises. Prøves separat for hver handling.
- **AK-03:** Gitt at en innlogget bruker ikke er part i en forespørsel, når brukeren forsøker å åpne den direkte, så skal forespørselen, forslagene og kontaktinfo ikke vises.
- **AK-31:** Gitt en forespørsel som ikke er godtatt, når motparten ser den, så skal telefon og e-post ikke vises. Etter aksept skal begge se hverandres telefon og e-post.

## Søk og annonsedetaljer (FK-02, KK-02)

- **AK-04:** Gitt at det finnes en tilgjengelig annonse med et bestemt ord i tittel eller beskrivelse, når brukeren søker etter ordet, så skal annonsen vises i søkeresultatet.
- **AK-05:** Gitt at et søk ikke finner noen annonser, når resultatet vises, så skal brukeren få en tydelig melding om at ingen annonser ble funnet.
- **AK-41:** Gitt at brukeren velger kategori, handelstype, tilstand eller pris fra/til, så skal bare annonser som passer alle valgene vises med én gang, og valgene skal stå igjen i filtrene. Opsjoner som ikke ville gitt treff, skal være grå og ikke kunne velges (Max 10.10, #102, #122).
- **AK-06:** Gitt at en bruker åpner en annonse fra søkeresultatet, så skal brukeren se beskrivelse, handelstype, pris eller gratisstatus, tilstand og, ved lån, opptatte datoer.

## Legge ut annonse (FK-03, TK-02, TK-04, KK-05)

- **AK-07:** Gitt at en student er logget inn og har fylt inn de påkrevde opplysningene, når studenten publiserer annonsen, så skal den lagres med studenten som eier og kunne finnes igjen etter ny innlogging.
- **AK-08:** Gitt at påkrevde opplysninger mangler eller er ugyldige, når studenten prøver å publisere, så skal annonsen ikke lagres og studenten skal få vite hva som må rettes.
- **AK-09:** Gitt at lagringen feiler, når studenten prøver å publisere, så skal appen ikke vise annonsen som publisert og studenten skal få en tydelig feilmelding.

## Forespørsel og svar (FK-04 til FK-06, TK-02 til TK-07, KK-03)

- **AK-10:** Gitt en innlogget student og en annonse som ikke er studentens egen, når studenten sender et gyldig bud, en gyldig låneperiode eller en forespørsel på «gis bort», så skal den lagres som ventende og være synlig for begge parter.
- **AK-11:** Gitt en låneperiode under én uke eller med opptatte datoer, når studenten prøver å sende forespørselen, så skal den ikke lagres og studenten skal få en forklaring uten å miste det som er fylt inn.
- **AK-32:** Gitt at en student prøver å sende forespørsel på egen annonse, så skal serveren avvise den uten å lagre noe.
- **AK-12:** Gitt en ventende forespørsel som kan godtas etter tilgjengelighetsreglene, når eieren godtar den, så skal begge parter se en lagret avtale med vilkårene.
- **AK-24:** Gitt en ventende forespørsel, når eieren avslår den, så skal begge se avslaget uten at en avtale opprettes.
- **AK-13:** Gitt at en bruker ikke er parten som har tur, når brukeren prøver å godta, avslå eller sende motforslag, så skal serveren avvise handlingen uten endring.
- **AK-14:** Gitt at ett lån allerede er godtatt for en periode, når eieren prøver å godta et annet lån av samme ting i en overlappende periode, så skal godkjenningen avvises og den første avtalen forbli uendret.
- **AK-15:** Gitt at lagringen av en forespørsel eller et svar feiler, når brukeren utfører handlingen, så skal appen ikke vise den som fullført, og brukeren skal få en tydelig feilmelding.
- **AK-33:** Gitt flere ventende bud på samme salgsannonse, når eieren godtar ett, så skal annonsen forsvinne fra søket og de andre budene avslås.

## Bruk på ulike enheter og tilgjengelighet (KK-01, KK-04, DK-03, DK-04)

- **AK-16:** Gitt en mobil, et nettbrett eller en PC, når brukeren utfører en kjerneoppgave, så skal alle nødvendige felt og handlinger være tilgjengelige uten at innhold skjules av layouten. Prøves separat for søk, annonsevisning, publisering, forespørsel, svar, motforslag og overleveringsbekreftelse.
- **AK-17:** Gitt at brukeren navigerer med tastatur eller høy zoom, når brukeren utfører kjerneoppgavene, så skal fokus være synlig og alle nødvendige kontroller kunne nås og brukes. Skjemaer skal ha tilknyttede feltetiketter.

## Motforslag og handelstyper (FK-03 til FK-06, TK-03, TK-07)

- **AK-18:** Gitt en ventende forespørsel, når eieren foreslår en annen pris eller periode, så skal forespørreren se endringen og kunne godta, avslå eller sende nytt motforslag. Motforslaget alene oppretter ingen avtale.
- **AK-19:** Gitt et gjeldende motforslag som kan godtas etter tilgjengelighetsreglene, når parten som har tur godtar det, så skal begge se en lagret avtale med de justerte vilkårene.
- **AK-25:** Gitt et gjeldende motforslag, når parten som har tur avslår det, så skal begge se avslaget uten at motforslaget blir en avtale.
- **AK-20:** Gitt en utenforstående eller parten som ikke har tur, når vedkommende prøver å godta motforslaget, så skal serveren avvise handlingen uten å endre forespørselen.
- **AK-21:** Gitt en salgsannonse, når en student legger inn et bud, så må selgeren svare. Budet støtter samme flyt med godta, avslå og motforslag.
- **AK-22:** Gitt en låneannonse uten ukepris, når studenten foreslår en periode, så skal forespørselen vise at lånet er gratis og ikke kreve noen pris.
- **AK-23:** Gitt at eieren publiserer én annonse for hver av salg, lån og gis bort, når en student åpner dem, så skal handelstype og pris eller gratisstatus være synlig for hver.

## Overlevering, forlengelse og retur (FK-07 til FK-10, TK-02, TK-03)

- **AK-34:** Gitt en godtatt avtale, når bare én part har bekreftet overlevering, så skal avtalen ikke vises som fullført. Når begge har bekreftet, skal salg og gis bort vises som fullført og lån som i bruk.
- **AK-35:** Gitt et lån i bruk, når én part foreslår senere returdato som overlapper et annet godtatt lån, så skal forslaget avvises. Et gyldig forslag gjelder først når motparten har godtatt det.
- **AK-36:** Gitt et lån i bruk, når en part rapporterer et returproblem, så skal rapporten lagres uten å endre avtalens status.
- **AK-26:** Gitt et lån i bruk, når eieren bekrefter mottatt retur, så skal lånet lagres som fullført og vises slik for begge etter ny innlogging, uten at låneren bekrefter.
- **AK-27:** Gitt at en innlogget bruker ikke er eieren, når brukeren forsøker å bekrefte retur, så skal serveren avvise handlingen uten å endre avtalen. Prøves både med låneren og en utenforstående.
- **AK-28:** Gitt at lagring av returbekreftelsen feiler, når eieren bekrefter, så skal appen vise feil uten å vise lånet som fullført.
- **AK-29:** Gitt en forespørsel som ikke er godtatt, når eieren forsøker å bekrefte retur, så skal serveren avvise handlingen uten å endre status.
- **AK-38:** Gitt at bare én part har bekreftet overlevering, når det har gått 3 dager uten at motparten har bekreftet, så skal overleveringen regnes som bekreftet av begge.
- **AK-39:** Gitt en forespørsel uten svar, når det har gått 7 dager, så skal den lagres som utløpt og ikke kunne godtas.
- **AK-40:** Gitt en returrapport, når motparten eller en utenforstående prøver å lese den, så skal den ikke vises.
- **AK-37:** Gitt et lån med ukepris på 100 kr og en periode på 10 dager, når forespørselen vises, så skal prisen være 100 / 7 × 10 kr.

**Før endelig godkjenning:** avklar kategorilisten, bildelagring og hvordan admin leser returrapporter, og gå gjennom kriteriene med Emil. Kriteriene er utkast, ikke ferdige eller beståtte tester.
