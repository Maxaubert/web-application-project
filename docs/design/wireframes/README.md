# Wireframes og skjermspesifikasjon

**Laget 29.09.2026** med Claude Design i Claude Code, etter Max sine valg underveis.
Emil har ikke gjennomgått innholdet ennå. Dette dokumentet er byggegrunnlaget for
skjermene. Det er ikke implementert kode. Beslutningene nedenfor er også ført inn i
[kravspesifikasjonen](../../krav/kravspesifikasjon.md) (29.09.2026), som eier kravene.

- **Redigerbart lerret:** <https://claude.ai/artifact/CnhymdWdfZZRhE5t6VTtE7>
  (privat, må deles fra Share-menyen før andre kan åpne det). Lerretet åpner i
  «Gjennomgang», en lysbildevisning av hovedflyten med bryter for mobil og desktop.
- **Bilder:** [png/](png/) har én PNG per skjerm, mobil (390 px) og desktop (1280–1440 px).
- **Kildefiler:** [kilde/](kilde/) er en kopi av lerretet (`.dc.html` per skjerm og
  `canvas.json`) per 29.09.2026. Lerretet er fasiten hvis de to spriker.
- **Sign-off:** [rapporten](../../leveranser/sign-off/rapport.pdf) viser et utvalg av skjermene.
  Kilden er [rapport.html](../../leveranser/sign-off/rapport.html).
- **Eksportere på nytt** etter endringer på lerretet: last ned filene til `kilde/`, og kjør
  fra repo-roten `node scripts/wireframes-til-png.mjs <abs>/docs/wireframes/kilde <abs>/docs/wireframes <abs>/app`
  og `node scripts/html-til-pdf.mjs <abs>/docs/sign-off/rapport.html <abs>/docs/sign-off/rapport.pdf <abs>/app`,
  der `<abs>` er full sti til repoet. Skriptene bruker Playwright fra `app/` og rendrer lokalt.

## Beslutninger fra wireframe-arbeidet

Avklart av Max 29.09.2026. Disse erstatter eldre varianter i notatet
`School/kravdiskusjon.md` der de spriker, og er ført inn i kravspesifikasjonen.

| Tema | Beslutning |
|---|---|
| Innlogging | Bare e-post, ingen passord. Appen sender en sekssifret engangskode, ingen lenke (endret 05.10). Kun `@hiof.no`. Samme flyt for ny og eksisterende konto. Løsning: better-auth. Regler og grenser står i [kravspesifikasjonen](../../krav/kravspesifikasjon.md). |
| Kontooppsett | Ny bruker fyller inn fullt navn, land og telefon én gang. Navn kan ikke hentes fra e-postadressen. |
| Tilgang | Innlogging kreves før annonser kan ses eller søkes i. |
| Handelstyper | Salg, lån og gis bort. Én type per annonse. Lån har valgfri ukepris (tom betyr gratis). |
| Forespørsel ved salg | Bare et bud i kroner. Mottakeren godtar, avslår eller foreslår en annen pris, på omgang. |
| Forespørsel ved lån | Bare en periode (fra og til), minst én uke. Opptatte datoer kan ikke velges. |
| Gis bort | Som salg, men uten bud: forespørsel, eier godtar, begge bekrefter overlevering. Ingen retur. Skjermen for selve forespørselen er ikke tegnet. |
| Sted og tid | Ikke i appen. Partene avtaler overlevering på telefon eller e-post etter aksept. |
| Kontaktinfo | Telefon og e-post vises først for motparten etter godtatt forespørsel. |
| Overlevering | Begge bekrefter. Salget er fullført når begge har bekreftet. |
| Forlengelse | Begge kan foreslå ny returdato. Standardforslag er dagen etter nåværende returdato. |
| Retur | Bare eieren bekrefter retur ved lån. |
| Pris for lån | Ukepris delt på 7, ganget med antall dager. |
| Frister | Ubesvart forespørsel utløper etter 7 dager. Har bare én part bekreftet overlevering, regnes den som bekreftet etter 3 dager. |
| Returrapporter | Bare den som skrev og admin kan lese dem. Admin kontakter partene ved behov. |
| Bilder | Sannsynligvis Cloudflare R2, muligens D1. Ikke endelig valgt. |
| Min side | Én side med profil (bilde, navn, e-post, telefon) og fanene Mine annonser, Forespørsler og Historikk. Rediger profil og logg ut ligger under profilen. |
| Hovedmeny | Annonser, Min side, Legg ut annonse. |
| API-stil | REST-endepunkter for lesing (T03), server actions for all skriving med tilgangskontroll i handleren (T04). |

## Felles regler for alle skjermer

- Alle skjermer finnes i mobil- og desktopversjon, med samme innhold.
- Gråtoner i wireframes betyr ikke endelig farge. Tekst skal være stor og lesbar,
  klikkflater minst 44 px, synlig tastaturfokus og etiketter på alle felt (KK-04, DK-03).
- Feil vises ved feltet og i en oppsummering øverst. Utfylt innhold beholdes (KK-03).
- Den stiplede merkelappen «Visning: …» øverst i wireframes er en merknad, ikke en del av appen.
- Plassholdere i hakeparentes, som `[Appnavn]` og `[Kategori]`, er ikke bestemt.

## Foreslått datamodell

Forslag som dekker skjermene. Ikke et vedtatt Drizzle-skjema (T02). Kode, tabeller, felt,
statuser, ruter og komponentnavn er på engelsk; teksten brukerne ser, er på norsk (Max 29.09).

| Tabell | Felt | Merknad |
|---|---|---|
| `user` | id, email (unik, `@hiof.no`), name, phone, image, created_at | Utvider better-auth sin brukertabell. `name` og `phone` er tomme til kontooppsett er fullført. |
| `listing` | id, owner_id, type (`sale`, `loan`, `giveaway`), title, description, category, condition (`new`, `like_new`, `used`), price, status (`active`, `sold`, `unpublished`), created_at | `price` er heltall i kroner. Salg: pris. Lån: ukepris eller tom. Gis bort: tom. |
| `listing_image` | id, listing_id, file, position | 1–10 per annonse. Første bilde vises i søket. |
| `request` | id, listing_id, requester_id, status, owner_confirmed, requester_confirmed, created_at | Status: `waiting_owner`, `waiting_requester`, `accepted`, `declined`, `withdrawn`, `expired`, `cancelled`, `in_use`, `completed`. |
| `offer` | id, request_id, sender_id, price, start_date, end_date, created_at | Hvert bud, motbud og forlengelse. Siste rad er gjeldende. Eldre rader er historikk. |
| `issue_report` | id, request_id, sender_id, type, description, created_at | Returproblem (WV-02). Lagres som påstand, avgjør ingenting. |

## REST-endepunkter (lesing)

Alle krever gyldig sesjon og svarer 401 uten.

| Metode og sti | Brukes av | Svar |
|---|---|---|
| `GET /api/listings?q=&limit=` og filtrene | WF-03, #104 | Bygget 10.10 (#98, T03; filtre #102). 200 med `{ listings: [{ id, title, type, price, status }] }`, best treff først; `q` søker feiltolerant i tittel, beskrivelse og selgerens navn, `limit` (1–50) begrenser antallet, uten `limit` alle treff. Godtar også forsidens filtre `category`, `type` og `condition` (kan gjentas), `minPrice` og `maxPrice`. 400 ved søk over 100 tegn, ukjent filterverdi, «fra» over «til» eller ugyldig `limit`, 401 uten økt, 403 uten fullført kontooppsett, 405 for andre metoder enn GET. Feil svarer `{ error: "norsk melding" }`. Bare de fem feltene sendes. `available`, bilde og «ledig fra» kommer med #100 og #61. |
| `GET /api/listings/:id` | WF-04 | 200 med annonse, bilder, eierens fulle navn og opptatte perioder, også for solgte annonser (Max 08.10). 404 hvis den ikke finnes eller er tatt ned. Telefon og e-post sendes aldri med. |
| `GET /api/requests?direction=received\|sent` | WF-07 | 200 med brukerens egne forespørsler og siste forslag. |
| `GET /api/requests/:id` | WF-08 | 200 bare for de to partene, ellers 404. Kontaktinfo bare når status er `accepted` eller senere. |
| `GET /api/me/listings`, `GET /api/me/history` | WF-09 | 200 med egne annonser eller fullførte avtaler. |

## Server actions (skriving)

Hver action sjekker sesjon, rolle og gjeldende status i handleren. Avvist handling
endrer ingenting i databasen.

| Action | Hvem | Regler |
|---|---|---|
| `completeAccount` | Ny bruker | Navn og telefon påkrevd og gyldige. |
| `createListing`, `updateListing` | Innlogget bruker / eier | `createListing` bygget 11.10 (#131): tittel 3–80 tegn, beskrivelse påkrevd (høyst 2000), kjent kategori, handelstype og tilstand. Pris: salg påkrevd heltall 0–100 000, lån valgfri (tom = gratis), gis bort alltid tom. Eier fra økten, aldri fra skjemaet; uten økt til `/login`, uten kontooppsett til `/account-setup`; ved suksess til `/listings/:id?publisert=1`. Bilder (1–10) kommer med #61. Bare eier kan redigere (`updateListing`, ikke bygget). |
| `unpublishListing` | Eier | Tar annonsen ut av søket. Endrer ikke eksisterende avtaler. |
| `sendRequest` | Innlogget bruker | Ikke egen annonse, annonsen er aktiv. Salg: bud > 0. Lån: minst 7 dager, ingen overlapp med godtatte lån. |
| `acceptOffer`, `declineOffer`, `sendCounterOffer` | Den som har tur | Bare siste forslag kan godtas. Godtatt salg setter annonsen til solgt og avslår andre ventende bud. Godtatt lån avslår overlappende ventende forespørsler. |
| `withdrawRequest` | Forespørrer | Bare mens den venter. |
| `cancelAgreement` | Begge | Bare før overlevering er bekreftet av begge. |
| `confirmHandover` | Begge | Salg fullføres når begge har bekreftet. Lån går til `in_use`. Har bare én bekreftet, regnes det som bekreftet etter 3 dager (planlagt jobb). |
| `proposeExtension` | Begge | Ny returdato etter nåværende, ikke over neste godtatte lån. Motparten godtar eller avslår. |
| `confirmReturn` | Eier | Bare ved lån i bruk. Fullfører lånet. |
| `reportIssue` | Begge | Lagrer rapport. Endrer ikke status. Bare avsender og admin kan lese den. |
| `updateProfile` | Innlogget bruker | Navn, telefon, bilde. E-post kan ikke endres. |

## Avvik fra tegningene (Max 08.10, #91)

- Selgerboksen viser fullt navn i stedet for fornavn, og navnet blir en lenke til selgerens annonser (FK-13, #93).
- Solgte annonser vises med «Solgt»-merke i stedet for borte-visningen. Borte-visningen gjelder nedtatte og
  ukjente annonser, med teksten «Den kan være tatt ned, eller lenken er feil.» og uten «Min side» til den siden finnes.
- Prisen står alene under tittelen; lån skrives «40 kr/uke» som på kortet.
- Handlingsknappen («Legg inn bud», «Send låneforespørsel») vises ikke før bud- og lånesidene er bygget.
- Gis bort er ikke tegnet (#64); inntil videre får eierboksen overskriften «Eier», som ved lån.

## Avvik fra tegningene (Max 10.10, #97)

- Søkefeltet heter «Søk i tittel, beskrivelse og selger», fordi søket også finner selgerens navn.
- Filtrene (#102, Max 10.10, avklart med mockup): Kategori (liste), Handelstype og Tilstand (avkrysning, flere valg) og
  Pris fra/til kr. Tilstand og pris er nye. Prisglideren fra mockupen er valgt bort; tallfeltene holder (Max 10.10).
  Valgene virker med én gang uten knapp (#122): avkrysning og kategori straks, pris når man forlater feltet eller
  trykker Enter. Opsjoner som ikke gir treff sammen med de andre valgene er grå og låst, uten tall; en avkrysset
  opsjon kan alltid fjernes. «Nullstill filtre» fjerner filtrene men beholder søket. På mobil ligger filtrene bak
  en «Filtre»-knapp med antall aktive filtre, i et ark nedenfra; «Vis X annonser» lukker arket. Wireframen viser
  dem åpne. «Tilgjengelig nå» (#100), sortering (#116) og «Vis flere» (#101)
  er ikke bygget. Tom visning har «Fjern søk» i stedet for «Fjern filtre».
- Live søkeforslag (#104) er ikke tegnet: fra to tegn vises en hvit liste under feltet med opptil fem treff
  (bildeplassholder, tittel, «type · pris») og siste rad «Vis alle treff for «…»». Piltaster, Enter og Escape
  følger combobox-mønsteret; ingen treff gir ingen liste.
- Ugyldig søk (over 100 tegn i adressen) gir 400 og meldingen «Ugyldig søk» i samme stiplede boks som tom visning.

## Avvik fra tegningene (Max 11.10, #133)

Legg ut annonse er bygget etter mockup 13, valgt blant tolv helsidemockups:

- Et hvitt kort over hele bredden som går helt ned til bunnen av skjermen (Max 11.10; uten kort ble prøvd og forkastet). Mini-forhåndsvisning av annonsesiden (bilde, så type, tittel, pris, kategori og
  tilstand) som følger med mens man skriver. Fra 1024 px står den til venstre og blir stående mens man ruller, med
  feltene til høyre; Kategori og Handelstype, og Pris og Tilstand, står parvis når feltkolonnen er bred nok. Under
  1024 px står forhåndsvisningen over feltene (Max 11.10, #135; én kolonne over hele bredden ble prøvd og forkastet:
  bildet ble for stort). Knappene står nederst til høyre i kortet, «Avbryt» til venstre for «Publiser annonse»;
  på mobil under hverandre med «Publiser annonse» øverst.
- Tittel og beskrivelse har bare en teller over feltet («0 av 80 tegn», «0 av 2000 tegn»), ingen hint. Prisen beholder
  hintet over feltet. Beskrivelsesfeltet har fast størrelse og kan ikke dras større (Max 11.10, #135).
- Bilder legges til ved å klikke på bildeflaten i forhåndsvisningen, ikke i et eget felt. Uten stiplede linjer eller
  ferdige tomme bildebokser (Max). Flaten er låst med en forklarende linje til opplasting kommer (#61).
- Rekkefølge: Tittel, Beskrivelse, Kategori, Handelstype, Pris, Tilstand. Handelstype står rett før Pris, fordi
  prisfeltet avhenger av den: «Pris (kr)» ved salg, «Pris per uke (kr, valgfri)» ved lån, ingen pris ved gis bort.
- Tilstand heter «Brukt», som i dataene og filtrene, ikke «Brukt, fullt fungerende».
- Etter publisering havner man på den nye annonsesiden med «Annonsen er publisert og synlig i søket» (bare for eieren).
- «Legg ut annonse» står i toppen på forsiden og annonsesidene («Legg ut» på mobil). På smale mobiler under 416 px
  vises bare logoen, så knappene får plass; navnet står igjen for skjermlesere.

## Skjermer

Filnavn viser til [png/](png/) og [kilde/](kilde/). Filnavnene er arbeidsnavn fra lerretet,
ikke kodenavn. Ruter og komponentnavn er forslag.

| WF | Skjerm | Mobil / desktop | Rute | Komponenter | Innhold og handlinger | Tilstander |
|---|---|---|---|---|---|---|
| 01 | Logg inn | `Main`, `Innlogging-desktop` | `/login` | `EmailForm`, `ErrorMessage` | Felt for HiØ-e-post, «Fortsett». | Feil adresse (`Innlogging-feil-*`). |
| 01 | Kode | `Innlogging-kode-*` | `/login/code` | `CodeForm` | Kodefelt, «Logg inn», «Send ny kode», «Endre e-post». Koden har 6 sifre (wireframen viser 4). | Feil eller utløpt kode ikke tegnet. |
| 02 | Fullfør kontoen | `Kontooppsett-*` | `/account-setup` | `AccountSetupForm` | E-post (låst), fullt navn, land, telefon, «Fullfør». Bare for nye kontoer. | |
| 03 | Annonser og søk | `Sok-*` | `/` | `TopNav`, `SearchField`, `Filters`, `ListingCard`, `ListingList` | Søk i tittel og beskrivelse, filtre kategori, handelstype, tilstand, pris og «Tilgjengelig nå / Alle». Kort med bilde, tittel, type og pris, tilgjengelighet. | Laster, ingen treff, feil (`Sok-laster-*`, `Sok-tomt-*`, `Sok-feil-*`). |
| 04 | Annonse, salg | `Annonse-mobil`, `Annonse-desktop` | `/listings/:id` | `ImageGallery`, `ListingInfo`, `OwnerCard`, `ActionButton` | Galleri, type, tittel, pris, «Legg inn bud», kategori, tilstand, beskrivelse, selgerens fulle navn. | Solgt: hele siden med «Solgt»-merke. Borte (`Annonse-borte-*`): nedtatt eller ukjent, samme tekst og 404. |
| 04 | Annonse, lån | `Annonse-leie-*` | `/listings/:id` | Som salg, pluss `AvailabilityCalendar` | Som salg, pluss ukepris, «Minst én uke», kalender med opptatte datoer og «Send låneforespørsel». | |
| 05 | Legg ut annonse | `Legg-ut-*` | `/listings/new` | `ListingForm`, `ListingPreview`, `ErrorSummary` (bygget 11.10, #133; avvik over) | Type, bilder (1–10), tittel, beskrivelse, kategori, tilstand, pris (ukepris ved lån, valgfri). Desktop viser forhåndsvisning av kortet. | Feltfeil (`Legg-ut-feil-*`). |
| 06 | Legg inn bud | `Foresporsel-salg-*` | `/listings/:id/bid` | `BidForm` | Varekort og «Ditt bud (kr)», «Send bud». | |
| 06 | Send låneforespørsel | `Foresporsel-leie-*` | `/listings/:id/loan` | `PeriodPicker`, `Summary` | Kalender der bare ledige dager kan velges, fra og til, oppsummering med beregnet pris (ukepris / 7 per dag), «Send forespørsel». | |
| 07 | Min side: Forespørsler | `Foresporsler-*` | `/me?tab=requests` | `MyPageTabs`, `ReceivedSentToggle`, `RequestRow` | Mottatt og Sendt. Rad med vare, type, motpart, bud eller periode, status og «Din tur». | Tom liste (`Foresporsler-tom-*`). |
| 08a | Nytt bud (selger) | `Avtale-venter-mobil`, `Avtale-nyttbud-desktop` | `/requests/:id` | `StatusBanner`, `OfferCard`, `History` | Bud og egen pris, «Godta», «Foreslå annen pris», «Avslå», historikk. | |
| 08a | Motbud (selger) | `Avtale-motbud-mobil`, `Avtale-venter-desktop` | `/requests/:id` | `CounterOfferForm` | Felt «Din pris (kr)», «Send motbud», «Avbryt». | |
| 08b | Avtalt (kjøper) | `Avtale-avtalt-*` | `/requests/:id` | `ContactCard`, `HandoverConfirmation` | Pris, kontaktinfo, overleveringsstatus for begge, «Bekreft at jeg har fått varen», «Avbestill». | |
| 08c | Salget er fullført | `Avtale-fullfort-*` | `/requests/:id` | `StatusBanner`, `History` | Begge bekreftelser med tidspunkt, pris, historikk. | |
| 08d | Lån i bruk | `Avtale-leie-aktiv-*` | `/requests/:id` | `ExtensionPanel`, `ReturnIssuePanel` | Periode, pris, kontakt. Forleng lånet (WV-01), retur som eieren bekrefter, og rapporter returproblem (WV-02). | |
| 09 | Min side: Mine annonser | `Minside-*` | `/me` | `ProfileCard`, `MyPageTabs`, `ListingCard` | Profil og faner. Egne annonser med status, «Rediger» og «Ta ned». Solgte annonser har ingen handlinger; låneannonser blir liggende med opptatte datoer. | |
| 09 | Min side: Historikk | `Minside-historikk-*` | `/me?tab=history` | `HistoryList` | Fullførte salg og lån, både gitt og mottatt. | |
| 09 | Rediger profil | `Profil-rediger-*` | `/me/profile` | `ProfileForm` | Bytt eller fjern bilde, navn, telefon, e-post (låst), «Lagre», «Logg ut». | |

## Ikke avklart

- Hvordan faktisk returdato registreres hvis eieren bekrefter retur senere.
- Når avbestilling stenges hvis bare én part har bekreftet overleveringen.
- Hvordan admin leser returrapporter uten admin-dashboard.
- Kategorilisten, appnavnet og endelig valg av bildelagring.
- Skjerm for forespørsel på «gis bort», og feilskjerm for feil eller utløpt kode.
