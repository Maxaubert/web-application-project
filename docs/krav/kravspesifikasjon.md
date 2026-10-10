# Kravspesifikasjon: deling og handel mellom studenter

> Arbeidsutkast, oppdatert 29.09.2026 etter Max' avklaringer 28.09 og 29.09. Dette er gjeldende produktbeskrivelse og krav, ikke dokumentasjon på en ferdig app. Behovet er ikke bekreftet gjennom brukerundersøkelser, og Emil har ikke gjennomgått endringene.

Her samles målgruppe, MVP, funksjonelle krav, forretningsregler, tekniske rammer,
kvalitets- og designkrav og akseptansekriterier. Hvordan kravene skal implementeres
planlegges separat i [teknisk plan](../app/teknisk-plan.md). Skjermene, foreslått datamodell
og API er beskrevet i [wireframes og skjermspesifikasjon](../design/wireframes/README.md).
[README](../../README.md) er inngangen.

**Kilder for oppdateringen:** Max' beslutninger 28.09.2026, samlet i det lokale notatet
`School/kravdiskusjon.md` (D-ID-ene under viser dit), og Max' valg under wireframe-arbeidet
29.09.2026. Der de to spriker, gjelder 29.09.

## 1. Problem og målgruppe

### Målgruppe

Den primære målgruppen er studenter ved Høgskolen i Østfold som trenger bøker, fagutstyr eller andre ting, og studenter som eier ting de vil selge, låne ut eller gi bort. Tjenesten dekker både skoleutstyr og ting studenter trenger i hverdagen, for eksempel en skjerm eller PC. Ved lansering er appen bare for HiØ-studenter (D-43).

### Problem

Studenter kan måtte skaffe bøker og annet utstyr til et emne eller en kortvarig oppgave. Å kjøpe noe nytt kan være dyrt når behovet bare varer en del av semesteret. Samtidig kan andre studenter sitte med ting de ikke lenger trenger etter å ha fullført et emne, eller som de ikke bruker for øyeblikket. Noen ting passer å selge videre, noen passer å låne ut for en periode, og noen vil eieren bare bli kvitt.

Vi vil undersøke om studentene mangler en enkel måte å finne hverandre og avtale kjøp, lån eller å gi bort ting. Ved lån må de også vite hva som gjelder for perioden og retur. Vi må undersøke om studentene faktisk opplever dette som et problem, hvordan de løser det i dag, og hva som eventuelt hindrer dem i å handle eller dele med hverandre.

### Foreslått løsning

Vi vil bygge en webapplikasjon der studenter kan legge ut og finne ting for salg, lån eller å gis bort. Ved salg legger en interessert student inn et bud. Ved lån ber studenten om en periode. Eieren kan godta, avslå eller foreslå en annen pris eller periode, og partene svarer på omgang. Når de er enige, ser begge hverandres telefon og e-post og avtaler overlevering utenfor appen. Betaling skjer også utenfor appen. Detaljer som ikke er avklart, står som åpne spørsmål nedenfor.

### Mulig verdi for brukerne

- Studenten som trenger en ting, kan kjøpe den brukt, låne den eller få den gratis, avhengig av hva eieren tilbyr. Det kan koste mindre enn nykjøp.
- Studenten som eier tingen, kan selge den, låne den ut gratis eller mot ukepris, eller gi den bort.
- Gjenbruk kan redusere behovet for nye kjøp og dermed ressursbruk. Miljøgevinsten er en forventning vi ikke har målt.
- Tydelig informasjon om pris, periode og status kan gjøre det enklere å avtale med hverandre.

### Beslutningsoversikt

«Avklart» betyr avklart av Max på oppgitt dato, ikke godkjent av Emil eller implementert.
Åpne valg må avklares før berørt funksjon bygges.

| Tema | Status | Beslutning eller neste avklaring |
|---|---|---|
| Handelstyper | Avklart 29.09 | Salg, lån og gis bort. Én type per annonse (D-01). Lån har valgfri ukepris; tom betyr gratis. Erstatter «salg, gratis lån og betalt leie» fra 19.09. |
| Innlogging | Avklart 29.09, endret 05.10 | Bare e-post, ingen passord. Appen sender en sekssifret engangskode til e-posten, ingen lenke (Microsoft Safe Links kan bruke opp lenker). Koden varer 5 minutter og tåler 3 feil forsøk. Maks 5 koder per adresse per time og 1 minutt mellom koder. Økten varer 30 dager og forlenges ved bruk; «Logg ut» sletter den på serveren. Kun `@hiof.no`. Samme flyt for ny og eksisterende konto. Løsning: better-auth. Feide er valgt bort (19.09; krever godkjenning hos Sikt og aktivering hos HiØ, sjekket 05.10). |
| Tilgang | Avklart 28.09 | Innlogging kreves før annonser kan ses eller søkes i. Ingen offentlig annonseoversikt (D-43 til D-45). |
| Kontooppsett | Avklart 28.09 og 29.09, utvidet 05.10 | Ny bruker fyller inn fullt navn, land og telefon én gang. Nummeret må være gyldig for valgt land og lagres i internasjonal form (+47…). Telefon og e-post deles bare med motparten etter godtatt forespørsel (D-13, D-14). |
| Forespørsel ved salg | Avklart 29.09 | Bare et bud i kroner. Mottakeren godtar, avslår eller foreslår en annen pris. Erstatter D-50 om at pris ikke kan endres. |
| Forespørsel ved lån | Avklart 29.09 | Bare en periode (fra og til), minst én uke (D-22). Opptatte datoer kan ikke velges. Motforslag gjelder perioden. |
| Gis bort | Avklart 29.09 | Som salg, men uten bud: forespørsel, eier godtar eller avslår, begge bekrefter overlevering. Ingen retur. |
| Sted og tid | Avklart 29.09 | Ikke i appen. Partene avtaler overlevering og retur på telefon eller e-post etter aksept. Erstatter D-03 til D-12 om møtepunkt og hentetid i forespørselen. |
| Overlevering | Avklart 28.09 og 29.09 | Begge bekrefter overlevering i appen. Salg og gis bort er fullført etter begge bekreftelsene; lån er da i bruk (D-36, D-37). Har bare én part bekreftet, regnes overleveringen som bekreftet 3 dager senere. |
| Retur | Avklart 29.09 | Bare eieren bekrefter retur ved lån. Låneren bekrefter ikke. Hvordan faktisk returdato registreres ved senere bekreftelse, er åpent. |
| Forlengelse | Avklart 28.09 | Begge kan foreslå senere returdato; den andre godtar eller avslår. Blokkeres ved kollisjon med annet godtatt lån (D-19 til D-25). |
| Avbestilling | Avklart 28.09 | Forespørrer kan trekke en ventende forespørsel. Etter aksept kan begge avbestille før overlevering. Ingen avbestilling midt i et lån (D-55). |
| Reservasjon | Avklart 28.09 | Ventende forespørsler reserverer ikke. Første godtatte avtale reserverer, og overlappende ventende forespørsler avslås (D-27 til D-29). |
| Salg fullført | Avklart 28.09 | Godtatt kjøpsforespørsel tar annonsen ut av søket og avslår andre ventende bud (D-30 til D-32). Solgte annonser kan ikke legges ut på nytt. Låneannonser blir liggende i søket, med opptatte datoer markert. |
| Varsler | Avklart 28.09 | E-post ved ny forespørsel, motforslag, aksept, avslag og avbestilling. Status vises også i appen (D-65 til D-67). Påminnelser om forsinket retur er med; kanal og hyppighet er åpent (D-86). |
| Returproblemer | Avklart 28.09 og 29.09 | Begge kan rapportere returproblem. Rapporten lagres som påstand og avgjør ingenting (D-87). Bare den som skrev og admin kan lese den; admin kontakter partene ved behov. Admin-dashboard er utenfor MVP (D-89), så hvordan admin leser rapportene, er åpent. |
| Utløp | Avklart 29.09 | En ubesvart forespørsel utløper etter 7 dager. Erstatter D-54. |
| Pris for lån | Avklart 29.09 | Lån med ukepris koster forholdsmessig per dag: ukepris delt på 7, ganget med antall dager. Minst én uke (D-22 til D-24). |
| Kategorier og bilder | Delvis avklart | Fast kategoriliste, men innholdet er åpent (D-47). Bilder lagres sannsynligvis i Cloudflare R2, muligens D1; ikke endelig valgt. |
| Solgte annonser | Avklart 08.10 | En solgt annonse kan fortsatt åpnes fra en lagret lenke og vises med «Solgt»-merke, så brukeren ser at varen er borte. Den fjernes etter 30 dager (#92). Nedtatte annonser vises ikke for andre. |
| Søk | Avklart 10.10 | Søket går i tittel, beskrivelse og selgerens navn, uten forskjell på store og små bokstaver (også æøå), og tåler skrivefeil og delord («kalkulater» og «kalk» finner «Kalkulator»). Best treff først; uten søkeord nyeste først. Filtre (Max 10.10, #102): kategori, handelstype og tilstand (flere valg), pris fra/til (lånepris per uke, tom pris regnes som 0 kr), med «Vis X annonser». Sortering kommer i egen oppgave (#116). Fra to tegn vises de fem beste treffene i en liste under feltet mens man skriver, med bilde, tittel og «type · pris»; klikk åpner annonsen, og siste rad viser alle treff. Ingen treff gir ingen liste (Max 10.10, #104). |
| Selgerens navn | Avklart 08.10 | Annonsesiden viser eierens fulle navn, ikke bare fornavn. Klikk på navnet skal vise brukerens andre annonser (FK-13, #93). Telefon og e-post vises fortsatt først etter aksept. |
| Historikk | Avklart 28.09 | Alle forslag bevares i historikken. Bare siste forslag kan godtas (D-53). Annonseendringer endrer ikke eksisterende avtaler (D-51). |

**Begreper:** «Salg» overfører eierskap mot betaling utenfor appen. «Lån» gir midlertidig bruk, gratis eller mot ukepris. «Gis bort» overfører eierskap uten betaling.

## 2. MVP og avgrensning

Første versjon omfatter e-postinnlogging, kontooppsett, søk og annonsedetaljer, publisering for alle tre handelstyper, bud og låneforespørsler med motforslag på omgang, deling av kontaktinfo etter aksept, overleveringsbekreftelse fra begge, forlengelse av lån, rapport om returproblem, e-postvarsler og Min side med egne annonser, forespørsler og historikk. Salgsflyten bygges først, deretter lån og gis bort; alle tre skal være med ved MVP-lansering (D-68).

### Ikke med i MVP

| Ikke med | Hva vi gjør i stedet | Kilde |
|---|---|---|
| Chat i appen | Forespørsler, bud og motforslag dekker avtalen. Chat er ønsket etter MVP. | D-70 til D-73 |
| Betaling i appen | Oppgjøret skjer utenfor appen. Pris og beregnet lånepris vises. | D-70 til D-73 |
| Frakt | Varer hentes og leveres fysisk mellom studentene. | D-70 til D-73 |
| Depositum | Ingen sikkerhet kreves; returproblemer kan rapporteres. | D-70 til D-73 |
| Vurderinger og anmeldelser | Ingen omdømmesystem i første versjon. | D-70 til D-73 |
| Tjenester, som undervisning og hjelp | Bare fysiske ting: salg, lån og gis bort. | D-70 til D-73 |
| Forsinkelsesgebyrer | Ingen gebyr. Godkjent forlengelse gir ny returdato. | D-85 |
| Admin-dashboard | Rapporter lagres og ses av den som skrev og admin. | D-88, D-89 |
| Full tvisteløsning i appen | En returrapport lagres som påstand og avgjør ingenting. | D-87 |
| Møtested og hentetid | Avtales mellom partene utenfor appen. | Max 29.09 |

Begrunnelsen for hvert punkt er ikke skrevet ned ennå.

### Hele appen, utover MVP

Chat er ønsket etter MVP. Betaling, vurderinger og konfliktløsning kan vurderes senere.

## 3. Funksjonelle krav for MVP

| ID | Funksjonelt krav |
|---|---|
| FK-01 | En HiØ-student skal kunne logge inn eller lage konto med e-post, uten passord, via en engangskode sendt til en `@hiof.no`-adresse. Første gang fyller brukeren inn fullt navn, land og telefon. |
| FK-02 | En innlogget bruker skal kunne søke i tittel, beskrivelse og selgerens navn med feiltolerant søk og forslag mens man skriver, filtrere på kategori, handelstype, tilstand, pris og «Tilgjengelig nå / Alle», åpne en annonse og se bilder, beskrivelse, handelstype, pris, tilstand og opptatte datoer for lån før en forespørsel sendes. |
| FK-03 | En innlogget bruker skal kunne legge ut en annonse for salg, lån eller gis bort, med tittel, beskrivelse, kategori, tilstand, 1 til 10 bilder og pris der den gjelder (salgspris, valgfri ukepris ved lån). |
| FK-04 | En innlogget bruker skal kunne sende en forespørsel på andres annonse: et bud ved salg, en periode på minst én uke ved lån, eller en forespørsel uten vilkår ved gis bort. |
| FK-05 | Eieren skal kunne godta, avslå eller foreslå en annen pris eller periode. Motforslaget sendes til forespørreren. |
| FK-06 | Forespørreren skal kunne godta, avslå eller sende nytt motforslag. Partene svarer på omgang, og bare siste forslag kan godtas. Begge skal se forslagshistorikken og hva de er enige om. |
| FK-07 | Ved lån skal eieren kunne bekrefte mottatt retur. Bekreftelsen fullfører lånet og vises for begge. Låneren bekrefter ikke. |
| FK-08 | Etter aksept skal begge parter se hverandres telefon og e-post og bekrefte overlevering i appen. Salg og gis bort er fullført når begge har bekreftet; lån er da i bruk. |
| FK-09 | Begge parter i et lån skal kunne foreslå en senere returdato, som den andre godtar eller avslår. |
| FK-10 | Begge parter i et lån skal kunne rapportere et returproblem. |
| FK-11 | Brukeren skal ha Min side med profil (bilde, navn, e-post, telefon) og fanene Mine annonser, Forespørsler og Historikk, og kunne redigere profil, ta ned egne annonser og logge ut. |
| FK-12 | Partene skal få e-post ved ny forespørsel, motforslag, aksept, avslag og avbestilling. |
| FK-13 | En innlogget bruker skal kunne klikke på eierens navn på en annonse og se brukerens andre aktive annonser (Max 08.10). |

### Informasjon per handelstype

| Opplysninger | Salg | Lån | Gis bort |
|---|---|---|---|
| Annonsepris | Salgspris (heltall kr) | Valgfri ukepris; tom betyr gratis. Prisen for lånet er ukepris / 7 per dag | Ingen |
| Forespørsel | Bud i kroner | Fra- og til-dato, minst én uke | Ingen vilkår |
| Motforslag | Annen pris | Annen periode | Ikke aktuelt |
| Overlevering | Avtales utenfor appen, begge bekrefter | Avtales utenfor appen, begge bekrefter | Avtales utenfor appen, begge bekrefter |
| Retur | Ikke aktuelt | Innen returdato; eieren bekrefter | Ikke aktuelt |

Påkrevde annonsefelt er tittel, beskrivelse, kategori, tilstand, bilder og relevant pris (D-46).
Tilstand er «Ny», «Som ny» eller «Brukt, fullt fungerende»; ting som må repareres, legges ikke ut (D-48, D-49).

### Felles avtale- og motforslagsflyt

Statusnavnene er arbeidsbegreper. Tabellen angir hvem som kan utføre handlingen, fra hvilken
tilstand og hva begge parter ser etterpå.

| Før | Handling | Hvem? | Etter |
|---|---|---|---|
| Ingen forespørsel | Send bud, låneforespørsel eller forespørsel | Interessert student | Venter på eier |
| Venter på eier | Godta | Eier | Godtatt; kontaktinfo vises for begge |
| Venter på eier | Avslå | Eier | Avslått |
| Venter på eier | Foreslå annen pris eller periode | Eier | Venter på forespørrer |
| Venter på forespørrer | Godta, avslå eller nytt motforslag | Forespørrer | Godtatt, avslått eller venter på eier |
| Venter på eier | Trekk forespørselen | Forespørrer | Trukket |
| Venter på eier eller forespørrer | 7 dager uten svar | Systemet | Utløpt |
| Godtatt | Avbestill | Begge, før overlevering | Avbestilt |
| Godtatt | Bekreft overlevering | Hver part for seg | Fullført (salg, gis bort) eller i bruk (lån) når begge har bekreftet |
| I bruk | Foreslå senere returdato | Begge | Motparten godtar eller avslår |
| I bruk | Bekreft mottatt retur | Eier | Fullført |

Har bare én part bekreftet overlevering, regnes den som bekreftet 3 dager senere. Når avbestilling stenges i mellomtiden, er ikke avklart.

### Tilgjengelighet og reservering

| Regel | Status og avgrensning |
|---|---|
| Overlappende godtatte lån | Avklart: samme ting kan ikke ha to godtatte lån i samme periode, også ved samtidige svar (TK-06). |
| Når reserveres tingen? | Avklart: først ved godtatt avtale. Ventende forespørsler reserverer ikke (D-27). |
| Flere ventende forespørsler | Avklart: tillatt. Når én godtas, avslås overlappende ventende lån og alle andre ventende bud ved salg (D-28, D-30). |
| Datogrenser | Avklart: hele returdatoen kan brukes, og neste lån kan tidligst starte dagen etter (D-63). |
| «Tilgjengelig nå» | Avklart: krever minst én hel ledig uke fra nå. En forsinket ting vises ikke som tilgjengelig før retur er registrert (D-62, D-64). |
| Eierens kalender | Avklart: eier setter ingen tilgjengelighetsplan. Ønsker kan stå i beskrivelsen (D-61). |

## 4. Tekniske krav og teknologivalg

| ID | Status | Teknisk krav |
|---|---|---|
| TK-01 | Avklart 29.09, endret 05.10 | Innlogging med better-auth: engangskode på e-post (6 sifre, 5 min, 3 forsøk, maks 5 per adresse per time), bare `@hiof.no`, økt i 30 dager. Appen skal kontrollere innlogget økt på serveren før beskyttede handlinger og visning av annonser. |
| TK-02 | Avklart | Appen skal lagre brukere, annonser, bilder, forespørsler, forslag med historikk, bekreftelser og returrapporter, slik at informasjonen finnes igjen etter utlogging. |
| TK-03 | Avklart | Bare eieren kan endre eller ta ned egen annonse. Bare parten som har tur, kan godta, avslå eller sende motforslag. Bare partene kan bekrefte overlevering, avbestille, foreslå forlengelse eller rapportere problem. Bare eieren kan bekrefte retur. Hver handling skal kontrollere part, rolle og gyldig status på serveren. |
| TK-04 | Avklart | Serveren skal validere data før lagring, for eksempel påkrevde felt, 1 til 10 bilder, pris som heltall, bud over null og at en låneperiode er minst én uke og ledig. |
| TK-05 | Avklart | Avtalestatus gjelder en konkret forespørsel. Lån har en periode; salg og gis bort har ingen. |
| TK-06 | Avklart | Appen skal hindre to godtatte lån av samme ting i overlappende perioder, også ved samtidige svar, og hindre at en solgt eller bortgitt ting godtas to ganger. |
| TK-07 | Avklart | Bare partene kan se en forespørsel og forslagene. En returrapport ses bare av den som skrev den og admin. Telefon og e-post vises først etter godtatt forespørsel. Tilgangen kontrolleres på serveren. |
| TK-08 | Avklart 29.09 | Lesing skjer via REST-endepunkter med ressurs-URL og riktig status også ved feil (T03). All skriving skjer via server actions med tilgangskontroll i handleren (T04). Se [skjermspesifikasjonen](../design/wireframes/README.md). |

**Tekniske rammer:** Appen skal oppfylle [emnekrav](../emne/emnekrav.md) T01 til T08. RedwoodSDK, React, TypeScript og Drizzle med D1 er satt opp. Datamodell og drift beskrives i [teknisk plan](../app/teknisk-plan.md).

## 5. Kvalitetskrav

| ID | Kvalitetskrav |
|---|---|
| KK-01 | Appen skal være enkel å bruke på mobil. En student skal kunne søke, åpne en annonse, legge ut en annonse og sende en forespørsel på en vanlig mobilskjerm uten at nødvendig innhold eller knapper blir utilgjengelige. |
| KK-02 | Søket skal gi resultater innen to sekunder med tusen testannonser (D-69). Testmiljø og målepunkt må spesifiseres før kravet kan verifiseres. |
| KK-03 | Hvis en forespørsel ikke kan sendes, skal brukeren få en tydelig forklaring og kunne prøve igjen uten å fylle inn alt på nytt. Appen skal ikke vise forespørselen som sendt før den er lagret. |
| KK-04 | Viktige oppgaver skal kunne utføres med tastatur, og tekst og knapper skal være lesbare med god kontrast og ved høy zoom. Sidene skal bruke semantisk HTML og riktige elementer for innhold, navigasjon, skjemaer og knapper. |
| KK-05 | Når en annonse eller forespørsel lagres, skal appen vise riktig resultat og status. Hvis lagring feiler, skal brukeren få beskjed, og appen skal ikke vise handlingen som fullført. |

Annonser er bare synlige for innloggede brukere, så offentlige SEO-krav er ikke aktuelle i MVP.

## 6. Designkrav

Grensesnittet skal oppleves moderne, enkelt, profesjonelt og elegant. De viktigste oppgavene skal være lette å finne, informasjonen skal ha tydelig hierarki, og farger, typografi, avstander og komponenter skal brukes konsekvent. [Wireframes](../design/wireframes/README.md) viser struktur og innhold for alle skjermer i mobil og desktop, ikke endelig visuell stil.

| ID | Designkrav |
|---|---|
| DK-01 | Brukeren skal enkelt finne søk, annonsedetaljer, publisering og egne forespørsler gjennom en fast hovedmeny: Annonser, Min side og Legg ut annonse. |
| DK-02 | Annonsevisningen skal gjøre de viktigste opplysningene lette å se: hva tingen er, pris, tilgjengelighet og hvordan man sender en forespørsel. Salg og lån har samme oppbygning; lån har i tillegg ukepris og kalender. |
| DK-03 | Designet skal ha god kontrast, lesbar tekst, klikkflater på minst 44 px og synlig tastaturfokus. Informasjon skal ikke forstås bare ut fra farge. |
| DK-04 | Designet skal være responsivt. De samme kjerneoppgavene skal kunne gjennomføres på mobil, nettbrett og PC. |

## 7. Akseptansekriterier for MVP

Akseptansekriteriene (AK-ID-er) står i egen fil: [akseptansekriterier](akseptansekriterier.md).

## Behov som bør undersøkes

Snakk med noen studenter som nylig har skaffet utstyr til et emne, og noen som har ting liggende. Spør hva de trengte, hvordan de løste det, hva det kostet, om de ville kjøpt brukt, lånt eller fått av en medstudent, og hva som ville gjort dem trygge nok til å gjøre det.

## Neste dokumentasjonssteg

Avklar de åpne spørsmålene i beslutningsoversikten, gå gjennom kravene og kriteriene med Emil, og fyll deretter [teknisk plan](../app/teknisk-plan.md) med datamodell og kontrakter fra [skjermspesifikasjonen](../design/wireframes/README.md).
