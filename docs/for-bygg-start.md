# Før vi bygger: beslutninger og to-do

Se også [den korte to-do-listen for planleggingsdokumentene](../TODO.md).

Arbeidsliste opprettet 16.09.2026. Alt nedenfor er **planlagt og ikke avkrysset**.
Avklart av Max 19.09: salg, gratis lån og betalt leie inngår i MVP, med forespørsler og
motforslag. Henting/retur avtales i forespørselen. Chat kommer senere, og hjelp/opplæring
er fortsatt åpent. Se [gjeldende kravspesifikasjon](../kravspesifikasjon.md).

Listen er ingen bestilling på implementering. [GitHub-planen](github-repo-oppsett.md)
beskriver oppsettet som skal støtte arbeidet. Repoer er nå opprettet; øvrige punkter
er ikke automatisk fullført. Studentene må fortsatt gjennomgå de åpne valgene sammen.

## Før funksjonsbygging

| Ferdig | ID | Oppgave og hva dere skal sitte igjen med | Foreslått ansvar |
|---|---|---|---|
| [ ] | F01 | Gå gjennom Max' avklaringer med Emil: alle tre handelstyper i MVP, forespørsler/motforslag, chat senere og oppgjør utenfor appen. Avklar gjenstående spørsmål og eventuell hjelp/opplæring. | Begge |
| [ ] | F02 | Undersøk behovet hos noen aktuelle studenter: hva gjør de i dag, hvor stopper det opp, og hvorfor bruke vår app? Noter ekte funn og usikkerhet. | Begge |
| [ ] | F03 | Skriv én tydelig problemformulering, første målgruppe og forventet brukerresultat. Avtal hvordan dere senere vurderer om flyten er nyttig. | Begge |
| [ ] | F04 | Tegn komplette brukerreiser for salg, gratis lån og betalt leie. Avklar gjenstående regler for forespørsler og fullføring. Behold chat på senere-listen og hjelp/opplæring som åpent spørsmål. | Begge |
| [ ] | F05 | Skriv korte funksjonsspesifikasjoner: mål, omfang, begrensninger og Gitt/Når/Så-kriterier. Skill funksjonelle krav, forretningsregler, kvalitetskrav og designkrav. Merk tekniske rammer som rammer. | Begge |
| [ ] | F06 | Avklar regler for tilgjengelighet, tidsperioder, forespørsel/godkjenning, henting/retur, avbestilling og konflikt. Ta stilling til betaling/depositum og verifisering av studenter uten å anta at det skal implementeres. | Begge |
| [ ] | F07 | Prioriter med metoden under og avtal kutt ved tidspress. Skill emnets minimum fra produktets minimum. Knytt begge til første leveranse. | Begge |
| [ ] | F08 | Finn største usikkerheter: teknikk, avtaler, persondata, eksterne tjenester og kapasitet. Velg korte, avgrensede undersøkelser med et spørsmål og stoppkriterium. | Eier per risiko, TBD |
| [ ] | F09 | Velg tillatt stack og driftsmål. Lag teknisk plan med enkel datamodell, API-kontrakt, server-/klientgrense, auth og eierskapskontroll. Beskriv alternativer og konsekvenser med egne ord. | Begge |
| [ ] | F10 | Planlegg wireframes for hovedflyten, navigasjon og tilstander: tomt, laster, feil, suksess. Avtal mobilbruk, store mål/tekst, tastatur og høy zoom. | Eier + medstudentreview, TBD |
| [ ] | F11 | Avtal hvilke persondata som trengs, hvem som får se dem, sletting/lagring og demonstrasjonsdata. Avklar eventuell juridisk usikkerhet før reell betaling eller offentlig pilot. | Begge |
| [ ] | F12 | Lag testplan fra kriteriene: enhet, reell integrasjon og browser-E2E. Ta med feil bruker, manglende innlogging, ugyldig input og overlappende forespørsler der reglene krever det. | Begge |
| [ ] | F13 | Ferdigstill gruppe-/KI-avtale, reviewpraksis og læringsrutine. Avtal arbeidskapasitet og hvordan begge blir kjent med hele appen. | Begge |
| [ ] | F14 | Del første flyt i små issues med eier, avhengigheter og verifikasjon. Sett milepæler mot bekreftede kursdatoer og reserver tid til feilretting, demo og eksamensøving. | Begge |
| [ ] | F15 | Avtal GitHub-eier, synlighet og oppsettstillatelse. Gjør G01–G10 når autorisert, og kontroller filer/historikk for hemmeligheter etter G22 før første publisering. Ingen skyressurser opprettes bare fordi denne listen finnes. | Begge |

«Ferdig» betyr at dere har tatt og dokumentert en brukbar beslutning, ikke at hele
produktet er låst. Små tekniske forsøk kan avklare risiko før detaljene er bestemte.
Vent ikke på en komplett trailer eller en spesifikasjon for alle fremtidige funksjoner.

## Prioritering: nytte, rekkevidde, risiko og innsats

Foreslått teammetode, ikke et påstått lærerkrav:

1. Marker først formelle emnekrav og det som er nødvendig for en sammenhengende hovedflyt.
2. Del funksjoner i **Må**, **Bør**, **Kan** og **Ikke i første versjon**. En Må-liste må
   passe faktisk kapasitet. Hvis alt er Må, er ingen prioritering gjort.
3. For valgfrie kandidater: sammenlign hvem/hvor mange som får nytte (reach), hvor stor
   nytten er (impact), hvor sikkert behovet er (confidence), og samlet innsats (effort),
   inkludert test og vedlikehold. Bruk lav/middels/høy med begrunnelse hvis dere mangler tall.
4. Hvis dere senere har meningsfulle estimater, kan RICE = rekkevidde × effekt × sikkerhet /
   innsats brukes som diskusjonsstøtte. Bruk samme tidsperiode og enhet. Ikke finn på
   brukerantall for å skape et presist poengtall; avhengigheter og risiko må vurderes separat.
5. Gi hvert valg en kort begrunnelse og noter hva som ville endret prioriteten.
   Revurder når ekte brukerinnspill eller tekniske funn kommer, og loggfør vesentlige kutt.

## Ved appgrunnlaget, ikke som papirarbeid på forhånd

- [ ] **F16:** Installer valgt starter og prøv samme oppskrift på begge maskiner. Legg inn
  dokumenterte miljøvariabler, migrasjoner og seed med falske data. Ingen app er opprettet nå.
- [ ] **F17:** Etabler G11–G16 og sikker workflow-praksis fra G21, inklusive reell CI og
  første E2E når flyten finnes. Sjekk at
  brudd faktisk fanges. Grønt tomt testoppsett er ikke akseptanse av en funksjon.
- [ ] **F18:** Bygg én tynn flyt helt gjennom UI, server og database, med tilgangskontroll
  og testbevis. La begge forklare requesten og lagringen uten KI.
- [ ] **F19:** Bruk faktiske erfaringer til å oppdatere krav, plan og board før neste flyt.

## Etter at hovedflyten virker

- [ ] **F20:** Planlegg autorisert preview/deploy, logging og gjenoppretting via G17–G20.
  Følg opp valgfrie avhengighetsvarsler og rapporteringsvei fra G22; hemmelighetskontrollen
  før første publisering skal allerede være gjort i F15.
- [ ] **F21:** Ferdigstill README og API-/arkitekturdokumentasjon fra faktisk oppførsel.
  Prøv installasjonsoppskriften fra en ren utsjekking. Knytt krav og tester til commit.
- [ ] **F22:** Lag logo, utvalgte sannferdige badges og trailer via G26–G29. Bruk fungerende
  app og eksempeldata. Dette skal ikke spise opp tid til testing og egen forståelse.
- [ ] **F23:** Gjennomfør brukertest, rett vesentlige problemer, prøv demoen og gå gjennom
  [leveranse](leveranse.md) og [læringskart](laering.md). Studentenes refleksjoner skrives av dem.

## Kontrollpunkt før neste fase

Første funksjon er klar til bygging når dere kan forklare brukerproblemet, inn/ut-omfang,
forretningsreglene, akseptansekriteriene, viktigste risiko og hvem som gjør/reviewer arbeidet.
Kravspekk og teknisk gjennomføringsplan gjennomgås samlet. Nye funksjoner får sin egen
korte avklaring; dere trenger ikke designe hele semesteret i detalj på forhånd.

Grunnlag: U26 s. 152–158 for specify/clarify/plan/tasks, og [emnekrav](emnekrav.md).
Prioriteringsmetoden, brukerundersøkelsen og den foreslåtte faseinndelingen er assistentforslag.
Se [GitHub-planens kildeavgrensning](github-repo-oppsett.md) før noe omtales som lærerkrav.
