# Wireframes og skjermspesifikasjon

**Laget 29.09.2026** med Claude Design i Claude Code, etter Max sine valg underveis.
Emil har ikke gjennomgått innholdet ennå. Dette dokumentet er byggegrunnlaget for
skjermene. Det er ikke implementert kode, og det erstatter ikke
[kravspesifikasjonen](../../kravspesifikasjon.md), som fortsatt må oppdateres med
de nye beslutningene nedenfor.

- **Redigerbart lerret:** <https://claude.ai/artifact/CnhymdWdfZZRhE5t6VTtE7>
  (privat, må deles fra Share-menyen før andre kan åpne det). Lerretet åpner i
  «Gjennomgang», en lysbildevisning av hovedflyten med bryter for mobil og desktop.
- **Bilder:** [png/](png/) har én PNG per skjerm, mobil (390 px) og desktop (1280–1440 px).
- **Kildefiler:** [kilde/](kilde/) er en kopi av lerretet (`.dc.html` per skjerm og
  `canvas.json`) per 29.09.2026. Lerretet er fasiten hvis de to spriker.
- **Sign-off:** [rapporten](../sign-off/rapport.pdf) viser et utvalg av skjermene.
  Kilden er [rapport.html](../sign-off/rapport.html).
- **Eksportere på nytt** etter endringer på lerretet: last ned filene til `kilde/`, og kjør
  fra repo-roten `node scripts/wireframes-til-png.mjs <abs>/docs/wireframes/kilde <abs>/docs/wireframes <abs>/app`
  og `node scripts/html-til-pdf.mjs <abs>/docs/sign-off/rapport.html <abs>/docs/sign-off/rapport.pdf <abs>/app`,
  der `<abs>` er full sti til repoet. Skriptene bruker Playwright fra `app/` og rendrer lokalt.

## Beslutninger fra wireframe-arbeidet

Avklart av Max 29.09.2026. Disse erstatter eldre varianter i kravspesifikasjonen
og i notatet `School/kravdiskusjon.md` der de spriker.

| Tema | Beslutning |
|---|---|
| Innlogging | Bare e-post, ingen passord. Appen sender engangskode og lenke til e-posten. Kun `@hiof.no`. Samme flyt for ny og eksisterende konto. Løsning: better-auth. |
| Kontooppsett | Ny bruker fyller inn fullt navn og telefon én gang. Navn kan ikke hentes fra e-postadressen. |
| Tilgang | Innlogging kreves før annonser kan ses eller søkes i. |
| Handelstyper | Salg, lån og gis bort. Én type per annonse. Lån har valgfri ukepris (tom betyr gratis). |
| Forespørsel ved salg | Bare et bud i kroner. Mottakeren godtar, avslår eller foreslår en annen pris, på omgang. |
| Forespørsel ved lån | Bare en periode (fra og til), minst én uke. Opptatte datoer kan ikke velges. |
| Gis bort | Som salg, men uten bud: forespørsel, eier godtar, begge bekrefter overlevering. Ingen retur. Skjermen for selve forespørselen er ikke tegnet. |
| Sted og tid | Ikke i appen. Partene avtaler overlevering på telefon eller e-post etter aksept. |
| Kontaktinfo | Telefon og e-post vises først for motparten etter godtatt forespørsel. |
| Overlevering | Begge bekrefter. Salget er fullført når begge har bekreftet. |
| Forlengelse | Begge kan foreslå ny returdato. Standardforslag er dagen etter nåværende returdato. |
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

Forslag som dekker skjermene. Ikke et vedtatt Drizzle-skjema (T02).

| Tabell | Felt | Merknad |
|---|---|---|
| `bruker` | id, epost (unik, `@hiof.no`), navn, telefon, bilde, opprettet | Utvider better-auth sin brukertabell. Navn og telefon er tomme til kontooppsett er fullført. |
| `annonse` | id, eier_id, type (`salg`, `lan`, `gis_bort`), tittel, beskrivelse, kategori, tilstand (`ny`, `som_ny`, `brukt`), pris, status (`aktiv`, `solgt`, `tatt_ned`), opprettet | Pris er heltall i kroner. Salg: pris. Lån: ukepris eller tom. Gis bort: tom. |
| `bilde` | id, annonse_id, fil, rekkefolge | 1–10 per annonse. Første bilde vises i søket. |
| `foresporsel` | id, annonse_id, foresporrer_id, status, eier_bekreftet, foresporrer_bekreftet, opprettet | Status: `venter_eier`, `venter_foresporrer`, `godtatt`, `avslatt`, `trukket`, `avbestilt`, `i_bruk`, `fullfort`. |
| `forslag` | id, foresporsel_id, avsender_id, pris, fra_dato, til_dato, opprettet | Hvert bud, motbud og forlengelse. Siste rad er gjeldende. Eldre rader er historikk. |
| `rapport` | id, foresporsel_id, avsender_id, type, beskrivelse, opprettet | Returproblem (WV-02). Lagres som påstand, avgjør ingenting. |

## REST-endepunkter (lesing)

Alle krever gyldig sesjon og svarer 401 uten.

| Metode og sti | Brukes av | Svar |
|---|---|---|
| `GET /api/annonser?q=&kategori=&type=&tilgjengelig=` | WF-03 | 200 med liste (tittel, type, pris, status, første bilde, ledig fra). 400 ved ugyldige filtre. |
| `GET /api/annonser/:id` | WF-04 | 200 med annonse, bilder, eierens fornavn og opptatte perioder. 404 hvis den ikke finnes eller er tatt ned. Telefon sendes aldri med. |
| `GET /api/foresporsler?retning=mottatt\|sendt` | WF-07 | 200 med brukerens egne forespørsler og siste forslag. |
| `GET /api/foresporsler/:id` | WF-08 | 200 bare for de to partene, ellers 404. Kontaktinfo bare når status er godtatt eller senere. |
| `GET /api/meg/annonser`, `GET /api/meg/historikk` | WF-09 | 200 med egne annonser eller fullførte avtaler. |

## Server actions (skriving)

Hver action sjekker sesjon, rolle og gjeldende status i handleren. Avvist handling
endrer ingenting i databasen.

| Action | Hvem | Regler |
|---|---|---|
| `fullforKonto` | Ny bruker | Navn og telefon påkrevd og gyldige. |
| `opprettAnnonse`, `redigerAnnonse` | Innlogget bruker / eier | Påkrevde felt, 1–10 bilder, pris heltall ≥ 0. Bare eier kan redigere. |
| `taNedAnnonse`, `kopierAnnonse` | Eier | Kopi lager ny annonse og endrer ikke gamle avtaler. |
| `sendForesporsel` | Innlogget bruker | Ikke egen annonse, annonsen er aktiv. Salg: bud > 0. Lån: minst 7 dager, ingen overlapp med godtatte lån. |
| `godta`, `avsla`, `sendMotbud` | Den som har tur | Bare siste forslag kan godtas. Godtatt salg setter annonsen til solgt og avslår andre ventende bud. Godtatt lån avslår overlappende ventende forespørsler. |
| `trekkForesporsel` | Forespørrer | Bare mens den venter. |
| `avbestill` | Begge | Bare før overlevering er bekreftet av begge. |
| `bekreftOverlevering` | Begge | Salg fullføres når begge har bekreftet. Lån går til i bruk. |
| `foreslaForlengelse` | Begge | Ny returdato etter nåværende, ikke over neste godtatte lån. Motparten godtar eller avslår. |
| `rapporterProblem` | Begge | Lagrer rapport. Endrer ikke status. |
| `oppdaterProfil` | Innlogget bruker | Navn, telefon, bilde. E-post kan ikke endres. |

## Skjermer

Filnavn viser til [png/](png/) og [kilde/](kilde/). Ruter er forslag.

| WF | Skjerm | Mobil / desktop | Rute | Innhold og handlinger | Tilstander |
|---|---|---|---|---|---|
| 01 | Logg inn | `Main`, `Innlogging-desktop` | `/logg-inn` | Felt for HiØ-e-post, «Fortsett». | Feil adresse (`Innlogging-feil-*`). |
| 01 | Kode | `Innlogging-kode-*` | `/logg-inn/kode` | Kodefelt, «Logg inn», «Send ny kode», «Endre e-post». Lenken i e-posten logger inn direkte. | Feil eller utløpt kode ikke tegnet. |
| 02 | Fullfør kontoen | `Kontooppsett-*` | `/kontooppsett` | E-post (låst), fullt navn, telefon, «Fullfør». Bare for nye kontoer. | |
| 03 | Annonser og søk | `Sok-*` | `/` | Søk i tittel og beskrivelse, filtre kategori, handelstype og «Tilgjengelig nå / Alle». Kort med bilde, tittel, type og pris, tilgjengelighet. | Laster, ingen treff, feil (`Sok-laster-*`, `Sok-tomt-*`, `Sok-feil-*`). |
| 04 | Annonse, salg | `Annonse-mobil`, `Annonse-desktop` | `/annonser/:id` | Galleri, type, tittel, pris, «Legg inn bud», kategori, tilstand, beskrivelse, selgerens fornavn. | Borte (`Annonse-borte-*`). |
| 04 | Annonse, lån | `Annonse-leie-*` | `/annonser/:id` | Som salg, pluss ukepris, «Minst én uke», kalender med opptatte datoer og «Send låneforespørsel». | |
| 05 | Legg ut annonse | `Legg-ut-*` | `/annonser/ny` | Type, bilder (1–10), tittel, beskrivelse, kategori, tilstand, pris (ukepris ved lån, valgfri). Desktop viser forhåndsvisning av kortet. | Feltfeil (`Legg-ut-feil-*`). |
| 06 | Legg inn bud | `Foresporsel-salg-*` | `/annonser/:id/bud` | Varekort og «Ditt bud (kr)», «Send bud». | |
| 06 | Send låneforespørsel | `Foresporsel-leie-*` | `/annonser/:id/lan` | Kalender der bare ledige dager kan velges, fra og til, oppsummering med beregnet pris, «Send forespørsel». | |
| 07 | Min side: Forespørsler | `Foresporsler-*` | `/min-side?fane=foresporsler` | Mottatt og Sendt. Rad med vare, type, motpart, bud eller periode, status og «Din tur». | Tom liste (`Foresporsler-tom-*`). |
| 08a | Nytt bud (selger) | `Avtale-venter-mobil`, `Avtale-nyttbud-desktop` | `/foresporsler/:id` | Bud og egen pris, «Godta», «Foreslå annen pris», «Avslå», historikk. | |
| 08a | Motbud (selger) | `Avtale-motbud-mobil`, `Avtale-venter-desktop` | `/foresporsler/:id` | Felt «Din pris (kr)», «Send motbud», «Avbryt». | |
| 08b | Avtalt (kjøper) | `Avtale-avtalt-*` | `/foresporsler/:id` | Pris, kontaktinfo, overleveringsstatus for begge, «Bekreft at jeg har fått varen», «Avbestill». | |
| 08c | Salget er fullført | `Avtale-fullfort-*` | `/foresporsler/:id` | Begge bekreftelser med tidspunkt, pris, historikk. | |
| 08d | Lån i bruk | `Avtale-leie-aktiv-*` | `/foresporsler/:id` | Periode, pris, kontakt. Forleng lånet (WV-01) og rapporter returproblem (WV-02). | |
| 09 | Min side: Mine annonser | `Minside-*` | `/min-side` | Profil og faner. Egne annonser med status, «Rediger», «Ta ned», «Legg ut ny med samme detaljer». | |
| 09 | Min side: Historikk | `Minside-historikk-*` | `/min-side?fane=historikk` | Fullførte salg og lån, både gitt og mottatt. | |
| 09 | Rediger profil | `Profil-rediger-*` | `/min-side/profil` | Bytt eller fjern bilde, navn, telefon, e-post (låst), «Lagre», «Logg ut». | |

## Ikke avklart

- Avrunding og dagtelling når lån har ukepris og perioden ikke er hele uker.
- Hvem som bekrefter vanlig retur ved lån, og hvordan faktisk returdato registreres.
- Hva som skjer når bare én part har bekreftet overleveringen.
- Hvem som kan se returrapporter, og hvordan de følges opp uten admin-dashboard.
- Når en forespørsel utløper, nå som hentetidspunkt er fjernet.
- Kategorilisten, appnavnet og hvor bilder lagres.
- Skjerm for forespørsel på «gis bort», og feilskjerm for feil eller utløpt kode.
