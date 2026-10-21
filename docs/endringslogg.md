# Endringslogg

Løpende oversikt over vesentlige endringer i prosjektet: funksjoner, krav, beslutninger
og struktur. Nyeste først. Anbefalt av studentassistenten ved sign-off uke 40.

Detaljene står i Git-historikken og PR-ene; daglig arbeid står i
[arbeidsloggen](prosess/arbeidslogg-max-og-emil.md). Én linje per endring holder.
Skriv hvem som besluttet eller gjorde endringen, og lenk PR eller issue når det finnes.
Oppføringene til og med 05.10.2026 er rekonstruert fra Git-historikken samme dag.

## 2026-10-21

- Forespørsler (#188, skjermene): forespørselssiden viser nå den andres kontaktkort fra godtatt (navn, telefon og e-post som lenker, med linjen «Kontakt Kari for å avtale overlevering»), hvem som har bekreftet («Du» og den andres fornavn, uten farge), og knappene «Bekreft overlevering» og «Avbestill». Forespørreren har «Trekk tilbake» mens forespørselen venter. Avbestill og Trekk tilbake spør «Ja, …» først, som Avslå. Meldingene er «Overlevering bekreftet», «Avtalen er avbestilt» og «Forespørselen er trukket tilbake». Kontaktkortet står også i bruk og fullført. Max sa å bygge uten mockup. Automatisk bekreftelse og bekreftet retur kommer i #214. (Max, #188)

## 2026-10-20

- Forespørsler (#188, serverdelen): reglene for overlevering er på plass. `confirmHandover` lar hver part bekrefte for seg, og salg og gis bort er fullført (lån i bruk) når begge har det. `cancelRequest` lar begge avbestille en godtatt forespørsel og legger en solgt annonse ut igjen. `withdrawRequest` lar forespørreren trekke tilbake en ventende. `getContactForParty` gir den andre partens navn, telefon og e-post, bare til de to partene og bare når avtalen står. Kortet og knappene kommer i neste PR. Automatisk bekreftelse etter 3 dager og bekreftet retur ved lån er flyttet til #214. (Max, #188)
- Forespørsler (#208, knappene): forespørselssiden har nå Godta, Motbud og Avslå for lån og Godta og Avslå for gis bort, for den som har tur. «Motbud» på et lån åpner «Fra» og «Til» med antall dager og pris; periodefeltene er trukket ut i `PeriodFields`, som lånesiden også bruker. Meldingene er «Motbud sendt: 14.11 – 21.11» og «Du godtok forespørselen». Max godkjente mockupen og ba om at PR-en merges når den er ferdig. (Max, #208)
- Forespørsler (#208, serverdelen): reglene for å svare på lån og gis bort er på plass i `respondToOffer`. Et motbud på lån er en ny periode (minst 7 dager, ikke overlapp med et godtatt lån), gis bort har ikke motbud. Å godta et lån gjør perioden opptatt og avslår ventende forespørsler som overlapper; annonsen ligger fortsatt ute. En periode som overlapper et godtatt lån avvises. Overlappen kontrolleres på nytt etter at statusen er flyttet, så to samtidige aksepter aldri begge lykkes (D1 har ingen transaksjoner). Knappene på forespørselssiden kommer i neste PR. (Max, #208)

- Forespørsler (#186a, serverdelen): reglene for å sende en låneforespørsel (periode, minst 7 dager, ingen overlapp med godtatte eller pågående lån, TK-06) og en gis bort-forespørsel er på plass som `placeRequest`, med serverhandlingen `sendRequest`. `placeBid` er nå en tynn kontroll for salg oppå den samme funksjonen. Én pågående forespørsel per student per annonse; lån og gis bort kan ikke endres etter at de er sendt, bare salg-bud kan det. Låne-siden og knappene kommer i neste PR. #186 er delt i #186 (sende) og #208 (svare på lån). (Max, #186)
- Forespørsler (#186a, skjermene): lån og gis bort har knapper på annonsesiden, og en egen lånesiden `/listings/:id/loan` med «Fra» og «Til», en liste over opptatte perioder og en sum med antall dager og pris. Prisen er ukepris / 7 per dag, avrundet opp til hele kroner, slik at utlåneren aldri får mindre enn ukeprisen (Max 20.10; `loanPrice` var uavklart på avrunding). Forespørselssiden viser periode og pris for lån og «Ny forespørsel» i banneret; svarknappene for lån og gis bort kommer med #208, så eieren kan ikke svare ennå. Mockup godkjent av Max 20.10. (Max, #186)

## 2026-10-19

- Forespørselssiden (#205): Historikk-panelet med forslagene er tatt bort fra `/requests/:id`, og siden er én kolonne. «Historikk» er navnet på fanen på Min side med annonsene man har solgt eller kjøpt (#189, #93), ikke på forslagene i en forespørsel. Siden viser bare det siste forslaget i budkortet; eldre forslag bevares i databasen. FK-06 og README er oppdatert. (Max, #205)
- Forespørsler (#203): etter et svar (motbud, godta, avslå) vises en melding øverst på forespørselssiden: «Motbud sendt: 240 kr», «Du godtok budet» eller «Forespørselen er avslått». Den står i 5 sekunder og forsvinner. Før forsvant bare feltet og tallene endret seg uten at noe sa at det gikk bra (Max testet #187). Mockup med fire varianter; Max valgte meldingen som forsvinner. (Max, #203)
- Forespørsler (#201): et godtatt salg eller en godtatt gis bort tar annonsen ut av søket (status solgt) og avslår alle andre ventende forespørsler på den, slik kravene D-30 til D-32 sier. Max avgjorde at det skjer ved aksept, ikke ved overlevering, og at avbestilling legger annonsen ut igjen (kommer med #188). Annonsen kreves først med en betinget oppdatering, som også stopper to samtidige aksepter. Et lån røres ikke. Erstatter vakten fra #187. (Max, #201)

## 2026-10-18

- Forespørsler, del 5 (#187): den som har tur kan godta, sende motbud eller avslå på forespørselssiden. «Godta» er en stor knapp, «Motbud» åpner et prisfelt og «Avslå» ber om en bekreftelse. Bare siste forslag kan besvares (skjemaet sender med det som ble vist), og to samtidige svar kan aldri begge lykkes. Et bud som ikke er besvart på 7 dager utløper; mekanismen er «lat» (siden regner ut utløpet og skriving lagrer det), ikke cron. Så lenge ett bud er godtatt, kan ikke et annet bud på samme annonse godtas. Banneret har ikke lenger mørk fyll, for det lignet en knapp. «Sist endret» på Min side tar med statusendringer. Mockup valgt av Max. Withdraw («Trekk tilbake») og avbestilling kommer med #188. (Max, #187)

## 2026-10-17

- Forespørsler, del 4 (#193): Min side `/me` med profil, fanen Forespørsler og Mottatt/Sendt, og «Min side» som første knapp øverst til høyre (ikon på mobil). Hver rad har bilde, tittel, motpart og bud, type, «Sist endret» og en chip («Din tur», «Selgers tur», «Kjøpers tur» eller statusen), og er en lenke til forespørselssiden. Din tur ligger øverst. Tilbakelenken på forespørselssiden er «‹ Min side», og annonsekortet er en lenke til annonsen. Mine annonser og Historikk følger med #189 og #93. Mockup valgt av Max blant ti listestiler. (Max, #193)
- Forespørsler, del 3 (#192): forespørselssiden `/requests/:id`, bare visning for eieren og den som la inn forespørselen: status i et banner (mørkt når det er din tur), siste bud, og historikk med nyeste først. Andre enn de to partene får 404 med samme tekst som en ukjent annonse, og siden leser aldri telefon eller e-post. «Ditt bud» på annonsesiden er nå en lenke hit. Handlingsknappene kommer under budkortet med #187; Min side som inngang for selgeren kommer med #193. (Max, #192)
- Forespørsler, del 2 av 6 (#185): bud på salgsannonser. Siden `/listings/:id/bid`, serverhandlingen `sendBid` og reglene i `placeBid`. Knappen på annonsesiden har fire tilstander (Legg inn bud, Ditt bud med Endre bud, grået ut på egen og solgt annonse). Bud er fra 1 til 100 000 kr (README sa bud > 0; regelen fra #184 tillot 0 og er rettet). Et nytt bud erstatter det gamle så lenge selgeren ikke har svart, og det gamle blir historikk. En delvis unik indeks sørger for høyst én pågående forespørsel per student per annonse. (Max, #185)

## 2026-10-16

- Forespørsler, del 1 av 6 (#184): tabellene `request` og `offer` (én forespørsel per interessert student, ett bud, motbud eller forlengelse per `offer`-rad), Zod-validering av bud og perioder etter handelstype, og en tilstandsmaskin for hvem som kan flytte en forespørsel. Perioden «minst én uke» regnes som minst 7 dager med både fra- og til-dato medregnet. Kjøpsflyten er delt i #184 til #189. (Max, #184)

## 2026-10-12

- Docs (#182): Max godkjente anslagene i timelisten for 30.09–11.10 (33,50 timer); oppsummeringen er 54,50 timer. (Max, #182)
- Annonsesiden (#156): piler, teller, piltaster og sveip for å bla i bildene. Bildene ligger i en stripe som følger fingeren og glir
  (scroll snap), uten blink ved bytte. Pilene er grå og vises bare ved hover, trykk og tastaturbruk. Mockup godkjent av Max 12.10. (Max, #156)
- Docs (#176): arbeidsloggen og timelisten er ført fra 30.09 til 12.10 (timene er anslag som venter på Max' godkjenning), og wireframene har
  skjermbilder av den bygde Forhåndsvis-dialogen, mobil og desktop. (Max, #176)
- E2E (#174): en tilfeldig rød CI-kjøring ble forklart fra det opplastede sporet: testen handlet før hydreringen. Mobiltestene som
  skriver, klikker eller endrer DOM-en venter nå på networkidle. Beskrevet i CI-dokumentet. (Max, #174)
- «Legg ut annonse» (#171): ny knapp «Forhåndsvis» (mobil og desktop) som viser den ekte annonsesiden med det som er skrevet, i en dialog
  der man kan gå tilbake med «Avbryt» eller publisere. Knappen «Publiser annonse» heter nå «Publiser». (Max, #171)

## 2026-10-11

- Mobil (#167, del av #147): annonsesiden har 24 px tittel, mindre luft over bildet og miniatyrene på én rad som rulles sidelengs
  under 640 px. Fra 640 px som før. (Max, #167)
- Mobil (#169, del av #147): «Legg ut annonse» har ingen forhåndsvisning under 640 px, så «Tittel» står nær toppen; bildene legges til
  i miniatyrraden, og feilen om manglende bilde peker på «Legg til». Fra 640 px som før. (Max, #169)
- Mobil (#164, del av #147): søkefeltet og «Filtre» står på én rad under 640 px, med forstørrelsesglass i feltet. Etiketten og
  «Søk»-knappen skjules visuelt (de finnes for skjermlesere og Enter), og tastaturet får søketast. «Ved lån gjelder prisen per
  uke.» er fjernet fra filterarket (ingen hjelpetekst). Fra 640 px er søkefeltet som før. (Max, #164)
- Mobil (#162, del av #147): «Legg ut annonse» og «Logg ut» er ikonknapper på 44 px under 640 px, og sidetitlene på forsiden og
  «Legg ut annonse» er 24 px i stedet for 36 px, med mindre luft over tittelen. Fra 640 px er alt som før. (Max, #162)
- Nettlesertestene har egen lagring (#154): Playwright bruker `.wrangler/e2e-state` for D1 og R2, så testannonsene (`e2e-user`, E2E-HEIC …) ikke lenger havner i databasen til `npm run dev`. (Max, #154)
- Raskere forside (#155): hvert bilde får en miniatyr på 640 px, laget i nettleseren ved opplasting, som kort, søkeforslag
  og miniatyrraden bruker. Målt i produksjonsbygget med 34 annonser: bildedata 5136 → 1080 KB, dekodingstid 453 → 25 ms,
  dekodede piksler 147 → 24 MB. Miniatyren ligger i R2 ved siden av originalen (`.thumb.jpg`, ingen ny tabell), og
  finnes den ikke, sendes originalen. Demobildene fikk miniatyrer. (Max, #155)
- Demoannonser: 34 testannonser med 132 bilder fra Max (skalert til 1200 px JPEG, 19 MB), skrevet fra bildenotatene
  uten oppdiktede spesifikasjoner. Fem demostudenter og Skolens IT-avdeling, med `@studentmarkedet.invalid`, så ingen
  kan logge inn som dem. `scripts/seed.mjs` legger dem inn lokalt eller live (`--remote`) og fjerner dem (`--remove`).
  De fire gamle testannonsene er erstattet. (Max, #152)
- Bilder, tredje PR: forsidebildet vises på kortene og i søkeforslagene, og annonsesiden har stort bilde med
  miniatyrer (klikk bytter), etter godkjent mockup. Plassholder bare uten bilder. `GET /api/listings` sender
  `coverUrl`. Testannonsene har UUID-er og får bilder fra `scripts/seed-images/`. (Max, #150)
- «Legg ut annonse»: feltparene står side om side allerede fra 1280 px, så feltkolonnen blir omtrent like høy som
  forhåndsvisningen, og prishintene («Hele kroner.», «Tomt betyr gratis lån.») er fjernet. Mobiltilpasning samlet i #147. (Max, #146)
- Bilder, andre PR: bildefeltet i «Legg ut annonse» etter godkjent mockup. Klikk eller dra inn, miniatyrer med ✕,
  klikk gjør forsidebilde. HEIC gjøres om og alt skaleres til høyst 2000 px JPEG i nettleseren (`heic-to` 1.5.2,
  lastes bare ved behov). Minst ett bilde kreves. CSP tillater `blob:` for bilder, workere og lasting av dem, ellers
  ble forhåndsvisningene og HEIC-omgjøringen blokkert. (Max, #141)
- Testannonsene Drill og Telt for to er fjernet fra de lokale testdataene; de passet ikke for siden. (Max, #142)
- Bilder, første PR: R2-bucket `IMAGES`, tabellen `listing_image` med migrasjon, `createListing` tar imot opptil 10
  bilder (filtype fra innholdet, høyst 5 MB) og rydder bort filene hvis lagringen feiler, og `GET /images/...` bare for
  innloggede. Bilder er valgfrie til skjemaet kan sende dem. Valgt etter grilling: R2, ikke D1. (Max, #138)
- «Legg ut annonse» fyller siden: kortet går over hele bredden og helt ned, to kolonner fra 1024 px med forhåndsvisningen til venstre og feltene til høyre,
  små felt parvis. Én kolonne over hele bredden ble prøvd side om side og forkastet. (Max, #135)
- «Legg ut annonse» (FK-03) uten bilder: skjermbildet `/listings/new` etter mockup 13 (valgt blant tolv helsidemockups),
  med mini-forhåndsvisning som følger med, låst bildeflate til #61, feilboks med fokus og bekreftelse på den nye
  annonsesiden. «Legg ut annonse» i toppen. (Max, #133)
- Serverhandlingen for «Legg ut annonse» (FK-03): Zod-validering med norske feilmeldinger, alle feil samtidig,
  pris etter handelstype og eier fra økten. Høyeste pris satt til 100 000 kr, også i prisfilteret. Skjermbildet
  kommer i neste PR, bilder i #61. (Max, #131)

## 2026-10-10

- Småfeilrunde etter Max sitt funn: pekehånd også på selve avkrysningsboksen og nedtrekkslisten, «ikke tillatt»
  på låste felt, og telefonfeltet har samme mørke fokuskant som de andre feltene. Alle sider skannet automatisk
  for peker, klikkflater og synlig fokus på desktop og mobil; ingen andre funn. (Max, #128)
- Filtrene virker med én gang uten knapp (klientnavigasjon, fokus blir stående), pris når man forlater feltet.
  Opsjoner som ikke gir treff er grå. Filtreringen flyttet fra SQL til én ren funksjon på serveren etter søket,
  så de grå opsjonene alltid stemmer med søkeordet; tallkallet for «Vis X annonser» er fjernet. (Max, #122)
- Prisfeltene i filtrene er tekstfelt med tallastatur i stedet for `type="number"`: ingen pilknapper og ingen
  verdiendring ved rulling. (Max, #120)
- Filtre på forsiden: kategori, handelstype, tilstand og pris fra/til, i kolonne til venstre på desktop og bak en
  «Filtre»-knapp på mobil. «Vis X annonser» viser antallet mens man velger. Filtrert i SQL, validert med Zod,
  400 ved ugyldig verdi; `GET /api/listings` godtar de samme filtrene. Valgt etter mockups; sortering skilt ut
  som #116. (Max, #102)
- UI-finpuss etter Max sin test og en review-workflow: mørk kant i stedet for blå ramme på tekstfelt, pekehånd
  på knapper, logo lenker til forsiden, egen fanetittel per side, synlig fokus på kort, tydeligere markert
  søkeforslag, lange ord brytes, feil leses opp av skjermleser, og flere små hover- og størrelsesrettinger. (Max, #113)
- Live søkeforslag: fra to tegn viser søkefeltet de fem beste treffene mens man skriver, med piltaster, Enter,
  Escape og «Vis alle treff». Henter fra `GET /api/listings`; testet i ekte nettleser med Playwright. (Max, #104)
- Innloggede nettlesertester uten appkode: Playwright får en testøkt lagt rett i den lokale databasen og en
  signert cookie. Første tester: åpne en annonse fra kortet, og søkeskjemaet. (Max, #94)
- Lokal innloggingssnarvei `/dev/login` for seed-brukeren, bare under `npm run dev`. Endrer beslutningen fra
  05.10 om ingen innloggingsbakdør; begrunnelse: rask lokal testing. To låser, og Playwright beviser 404 i
  produksjonsbygget. (Max, #106)
- REST-endepunktet `GET /api/listings?q=&limit=` (T03): samme søk som forsiden som JSON med fem felt, 400 ved
  ugyldig søk, 401 uten økt, 403 uten kontooppsett, 405 for andre metoder. Egen API-vakt `requireApiUser`.
  Datakilde for live søkeforslag (#104). (Max, #98)
- Søk på forsiden (WF-03): feiltolerant søk i tittel, beskrivelse og selgerens navn med Fuse.js, best treff
  først. Søket står i adressen (`?q=`), ugyldig søk gir 400, ingen treff gir «Ingen annonser passer søket».
  FK-02 utvidet med selgerens navn og feiltoleranse. Filtre, «Vis flere» og REST-endepunktet er egne issues
  (#102, #101, #98). (Max, #97)
- Emils uferdige `app/src/sortedList.tsx` er slettet: sortering står ikke i kravene, og søket erstatter den.
  Max og Emil har avtalt at kodekvalitet går foran hvem som skrev koden. (Max, #97)

## 2026-10-08

- Annonsesiden `/listings/:id` (WF-04): kortet på forsiden lenker dit, og siden viser type, tittel, pris,
  kategori, tilstand, beskrivelse og eierens fulle navn. Solgte annonser vises med «Solgt»-merke; nedtatte og
  ukjente gir samme borte-visning med 404. Ingen handlingsknapp før bud- og lånesidene finnes. (Max, #91)
- Nye krav: solgte annonser fjernes etter 30 dager (#92), og klikk på eierens navn viser brukerens andre
  annonser (FK-13, #93). Fullt navn i stedet for fornavn på annonsesiden. (Max)
- Emils uferdige `app/src/sortedList.tsx` gjorde `develop` rød. Minste retting for å få CI grønn: type på
  `event`, `Number(...)` på valgt verdi, ubrukt import fjernet og lint for ubrukte variabler og `any` slått av
  i bare den fila til den er ferdig. Resten er urørt. (Max, #91)

## 2026-10-07

- Appnavnet er Studentmarkedet, som domenet: topplinjen, fanetittelen, avsendernavnet og emnet i
  innloggingseposten. (Max, #88)
- Automatisk deploy til studentmarkedet.org fra `main` etter grønn CI, med skymigrasjon før koden
  (`.github/workflows/deploy.yml`). (Max, #82)
- Forsiden viser aktive annonser som kort, nyeste først, med «type · pris» som i WF-03. `PageShell` har fått
  bredt oppsett og «Logg ut» i topplinjen (#65). Emils utkast `app/src/post.tsx` er fjernet; kortet tar over visningen. (Max, #79)
- Annonsetabellen `listing` med låste kategorier, handelstyper, tilstander og statuser, sjekket både i
  TypeScript og i databasen, pluss lokale testannonser (`npm run db:seed:local`). (Max, #79)
- `develop` har nå lett grenbeskyttelse: GitHub krever ikke lenger PR eller grønn CI der, men blokkerer
  sletting og force-push. `main` er uendret. Arbeidsregelen om PR for alle endringer står. (Max, #75)
- Appen flyttet til eget domene https://studentmarkedet.org; workers.dev-adressen er slått av (Max).
- Innloggingskoder sendes på e-post med Resend fra eget domene `studentmarkedet.org` (kjøpt av Max hos
  Cloudflare). EmailJS med Gmail/GMX ble prøvd og valgt bort. (Max, #46)
- Appen på nett: Cloudflare Worker `webapp` med D1 `webapp-db` i skyen, deployet av Max etter KI-kurset
  leksjon 10 (#70). Innlogging på nett venter på EmailJS (#46).
- Regel om små PR-er i AGENTS.md: én oppgave, sikt mot under ca. 400 håndskrevne linjer; rundt 1000
  er for stort (faglærer, gjengitt av Max). (Max)

## 2026-10-05

- Komponentprinsipper vedtatt etter kryssjekk mot Fullstækk: del etter ansvar, én liten delt Button
  med tre varianter, «Legg ut annonse» som ett skjema med tre utskilte deler. Åpne beslutninger
  lagt på boardet (#61–#66). (Max, #60)
- `develop` har samme grenbeskyttelse som `main`; direkte push blokkeres. Oppskriften
  `.github/branch-protection.json` rettet (tom `contexts` sammen med `checks` ble avvist av GitHub). (Max, #58)
- Dependabot lager PR-er mot `develop` (Max).
- `develop` gjenopprettet som integrasjonsbranch: PR-er til `develop`, `develop` → `main` i egen PR
  med merge commit. CI kjører også for `develop` (Max, #51).
- Kanban-flyt i CLAUDE.md: hver funksjon eller retting på boardet før arbeid, To do → In progress →
  Review → Done. `develop` slettet; bare `main` er fast branch (Max, #49).
- Innlogging med engangskode på e-post bygget (#47): bare kode, 6 sifre, 5 min, 3 forsøk,
  maks 5 koder per adresse per time, økt i 30 dager, kontooppsett med land og telefon, logger med
  maskert e-post, Tailwind. Telefon på én rad med rundt flagg og landskode; skjema i kort på
  desktop som i wireframes (Max' håndtest). Lokalt vises koden også i nettleserkonsollen. Valgene forsvart av Max i gjennomgang med Claude Code; koden skrevet
  av Claude Code. Lokalt skrives koden til terminalen; ekte e-post er #46. (Max)
- Innloggingslenken i e-posten er tatt ut av kravene (Microsoft Safe Links). Feide er bekreftet
  valgt bort: krever godkjenning hos Sikt og aktivering hos HiØ. (Max)
- L8a-raden er fjernet fra KI-avtalen; den var ikke avtalt. Tester skrevet av KI beskrives og
  godkjennes av Max først. (Max)
- [Review-sjekkliste](prosess/review-sjekkliste.md) for krav, dokumentasjon, struktur, overkomplisering,
  Fullstækk, sikkerhet, tester og logging, og `/prosjektreview` i Claude Code som kjører den. (Max)
- Arbeidsregler skjerpet i AGENTS.md: stegvis arbeid med plan først, studentene bestemmer,
  dokumentasjonen holdes konsistent i samme PR, School og Fullstækk-kurset sjekkes før krav og review.
  Max er eneste mergegodkjenner i reglene. PR-malen har ny sjekkliste. Claude Code skal utfordre hvert ikke-opplagt valg
  med spørsmål som studenten må forsvare (CLAUDE.md). (Max)
- Dokumentasjonen samlet i `docs/` med undermapper for krav, app, design, prosess, emne,
  leveranser og arkiv. Akseptansekriteriene er skilt ut fra kravspesifikasjonen.
  Utdaterte planfiler er flyttet til [arkivet](arkiv/README.md). (Max, med Claude Code)
- Endringsloggen opprettet. Studentassistentens KI-veiledning fra sign-off ført inn i
  [KI-avtalen](prosess/ki-avtale.md). (Max)
- Påkrevd review fjernet fra beskyttelsen av main; PR og grønn CI kreves fortsatt (Max, #38).
- TODO-listen erstattet av [Kanban-boardet](https://github.com/users/Maxaubert/projects/1) med
  GitHub Issues (Max, #36).
- `develop` flettet inn i main: innlogging, wireframes, sign-off og logg (Max og Emil, #35).

## 2026-09-30

- KI-avtalen godtatt av Max og Emil.
- Første enhetstest (lånepris), rapportdisposisjon med plassholdertittel og sign-off-side
  med bevis for alle Canvas-punktene. (Max)

## 2026-09-29

- Wireframes og skjermspesifikasjon for hovedflyten, og kravspesifikasjonen oppdatert etter
  Max' avklaringer 28.–29.09 (Max, #11).
- Innloggingssiden videreutviklet (Emil). Typer og grønn CI for innloggingskomponentene (Max, #37).
- Arbeidslogg, timeliste og lokal WAL-rutine innført (Max, #12).

## 2026-09-23

- `"use client"` lagt til i innloggingskomponenten, som rettet useState-feilen (Emil).

## 2026-09-21

- RedwoodSDK-appgrunnlag med lokal D1, Drizzle, Vitest og Playwright (Max, #3).
- Innloggingssiden påbegynt (Emil).

## 2026-09-19

- Prosjektgrunnlag: emnekrav, kilder, kravspesifikasjon for studentmarkedet og CI-pipeline
  (Max, #1 og #2).

## 2026-09-18

- Repoet opprettet (Max).
