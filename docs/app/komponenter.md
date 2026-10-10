# Komponenter: prinsipper og plan

Besluttet av Max 05.10.2026 etter en gjennomgang mot Fullstækk-kursene (lærerens kursmateriell),
Canvas og ekstern praksis. Grunnlaget med alle kilder ligger i Max' forskningsnotat
`research/webapp-studentmarked/2026-10-05-komponentoppdeling.md` (utenfor repoet). Kursreferansene
under er `RR` = React-kurset og `KI` = KI-kurset i `School/ITF31619-Webapplikasjoner/fullstaekk/`.
Dette er beslutningsgrunnlag, ikke rapporttekst: arkitekturbegrunnelsen i rapporten skriver
studentene selv.

## Når blir noe en egen komponent?

Del etter **ansvar, ikke linjeantall** (RR/08-komponent-separasjon.md:1071). En del skilles ut når:

1. den har eget ansvar med egen state eller logikk, eller må være klientkomponent mens forelderen kan
   være serverkomponent (KI/05-frontend-react.md:54, «server components så lenge du kan»);
2. den brukes i to eller flere filer (gjentakelse i én fil er greit);
3. den trenger egne tester.

En lang fil er et signal om å se etter, ikke en regel. Hjelpekomponenter som bare brukes i én fil,
blir private funksjoner i den filen. Start enkelt og del når et faktisk problem oppstår
(RR/06-react-basis-komponent.md:22-43). Lag ikke komponenter «for sikkerhets skyld».

**Hvorfor:** dette er Single Responsibility-prinsippet brukt på komponenter, slik kurset begrunner
oppdelingen i leksjon 8 (RR/08:30-40): en del med ett ansvar er lettere å forstå, teste og endre.
React-dokumentasjonen sier det samme: en komponent bør helst gjøre én ting, og deles når den vokser
(react.dev, «Thinking in React»). Grensen mellom server og klient er også en reell arkitekturgrense,
fordi alt under en `"use client"`-grense sendes til nettleseren.

**Hvorfor ikke en linjegrense (for eksempel 100 linjer):** kursets egen fasit avviser linjeantall som
begrunnelse (RR/08:1071), og AGENTS.md sier «ingen vilkårlige linjegrenser». En linjegrense deler
koden på feil sted: den kan splitte én sammenhengende oppgave i to, og la to ulike oppgaver stå sammen.

**Hvorfor ikke mange små komponenter fra start:** for tidlig abstraksjon gir flere filer, flere props
og mer å forklare uten at noen trenger det. Kurset kaller det over-engineering av ukjente problemer
(RR/06:38-43) og spør eksplisitt når abstraksjon er «for tidlig» (RR/10:1697).

## Delt UI i `app/src/app/shared/`

Faste regler fra finpussen (#113, Max 10.10):

- `PageShell` krever `title`; den gir fanetittelen «Side – Studentmarkedet» (React 19 flytter `<title>` til `<head>`).
  Logo og navn er en lenke til `/`.
- Tekstfelt bygges fra `inputClass`, som gir mørk kant ved fokus i stedet for den blå rammen. Knapper og lenker
  beholder den blå 3 px-rammen ved tastaturfokus (`:focus-visible` i `styles.css`).
- Alle knapper viser pekehånd (regel i `styles.css`, Tailwind v4 gjør det ikke selv). Hover brukes med
  `enabled:`, så en deaktivert knapp ikke endrer seg.
- `FieldError` har `role="alert"`, så feil leses opp. Lange ord brytes med `[overflow-wrap:anywhere]`.

| Komponent | Ansvar | Status |
|---|---|---|
| `Button` | Varianter `primary`, `secondary`, `link`; innebygd `type`, ventetilstand, `disabled` og `aria-busy`, 44 px og fokusring. Ingen `size`/`icon`-props. | Planlagt (#66). Erstatter `PrimaryButton` og kopierte klasser. |
| `TextField`, `FieldError` | Etikett, felt og feilmelding koblet med id-er. | Finnes (`form-controls.tsx`). |
| `TextArea`, `SelectField` | Samme mønster som `TextField`; kurset anbefaler egne input/select-komponenter (RR/08:288-290). | Lages med «Legg ut annonse». |
| `ErrorSummary` | Feiloppsummering øverst i lange skjemaer, med lenker til feltene. | Lages med «Legg ut annonse». |
| `PageShell` | Topplinje og sideramme. Smalt oppsett for skjemaer, `wide` for annonsesider, `headerAction` til høyre i topplinjen. | Finnes (#65 løst 07.10). |

### Hvorfor én delt `Button`

1. **En knapp er mer enn utseende.** Hver knapp i skjemaene må ha riktig `type` (en `<button>` i et
   skjema sender skjemaet som standard), være deaktivert og merket `aria-busy` mens serveren jobber
   (hindrer dobbel innsending, `teknikk.md`), ha synlig fokus og minst 44 px klikkflate (DK-03).
   Dette er oppførsel og tilgjengelighet, ikke bare farge. Én komponent gir én kilde til sannhet
   for alle disse kravene.
2. **Problemet er allerede målt i koden, ikke tenkt.** Ventetilstanden var kopiert på tre steder, og
   to av knappene manglet `aria-busy`. Det er glidningen kurset nevner som kostnad ved lange,
   gjentatte klassestrenger og ulik praksis i et team (RR/11-tailwind-v4.md:883-887).
3. **Det oppfyller vår egen deleregel.** Knappen brukes i mange filer (rundt 20 handlinger i fire
   roller i wireframes) og bærer egen logikk (ventetilstand). Tailwinds egen veiledning sier at
   gjentakelse innenfor én fil er greit, men at stiler som gjenbrukes på tvers av filer, best samles
   i en komponent (tailwindcss.com, «Managing duplication»).
4. **Kurset støtter mønsteret.** Leksjon 4 viser en `Button` med varianter som eksempel på bruk
   (RR/04-valg-rammeverk.md:553-597), leksjon 11 bygger en knapp med fargekart for varianter
   (RR/11:499-612), og leksjon 8 anbefaler egne felt-komponenter for likt utseende og riktig kobling
   (RR/08:288-290). Prinsippet er det samme for knapper.
5. **Vi holder den liten.** Tre varianter og standardverdier (convention over configuration,
   RR/10:30-36), ingen `size`- eller `icon`-props. Det unngår fella kurset advarer mot: komponenter med
   mange av/på-props (RR/10:1679).

### Hvorfor ikke Emils forslag (ingen knappekomponent)

Emils syn har gode argumenter: kursets eksempelapp har ingen delt knapp (hvert skjema lager sin egen
`SubmitButton`, RR/19:747-764), Tailwind-leksjonen skriver klasser rett i markupen (RR/11:903), og
en komponent er ett lag til å lære. Likt utseende kan løses med tema-tokens i `@theme`.

Det som veier tyngre for oss:
- Tokens og klassekonstanter sikrer **utseendet**, men ikke **oppførselen**. `type`, ventetilstand og
  `aria-busy` må fortsatt huskes på hver knapp, og vi har allerede glemt dem to ganger.
- Kursets eksempelapp lærer ett tema per leksjon; den viser ikke hvordan en app med mange skjermer
  holdes konsistent. At den kopierer `SubmitButton` fire ganger med ulike farger, er et eksempel på
  glidningen, ikke en anbefaling.
- Endring blir dyr uten komponent: skal alle primærknapper endres (farge, høyde, ventetekst), må det
  gjøres på hvert sted i stedet for ett.

**Hva som ville endret valget:** hvis appen bare hadde én eller to knapper, eller knappene ikke hadde
noen felles oppførsel, ville rå `<button>` med tokens vært det enkleste og riktige.

## «Legg ut annonse» (WF-05)

Ett `ListingForm` eier skjemaet og `useActionState`, og brukes både til å opprette og redigere
(RR/19-server-actions-forms.md:353-377). Skilles ut fordi de har eget ansvar eller gjenbrukes:

- `ImageUploader`: egen state for forhåndsvisninger, legg til/fjern og grensen 1–10 bilder.
- `ErrorSummary`: delt, se over.
- Forhåndsvisning på desktop: gjenbruker `ListingCard` fra søket.

Typevelger og prisfelt blir i `ListingForm` til de trengs andre steder. Prisreglene (heltall ≥ 0,
ukepris valgfri ved lån) testes i en egen funksjon ved siden av `shared/loanPrice.ts`.
**Hvorfor ett skjema:** skjemaet er én handling (opprett eller rediger én annonse) med én
serverhandling og én valideringsregel. Å dele selve skjemaet ville spredd state og feilhåndtering
over flere komponenter som må koordineres. Kurset bruker ett skjema per entitet, og samme skjema for
opprett og rediger (RR/19:353-377). Det gir én kode å teste og forklare.

**Hvorfor skille ut akkurat de tre:** hver av dem treffer deleregelen.
- `ImageUploader` har eget ansvar og egen state (forhåndsvisninger, fjerning, grensen 1–10) og er
  klientkode. Inne i skjemaet ville den blandet bildelogikk med feltlogikk; alene kan grensene
  testes (separation of concerns, RR/08:30-40).
- `ErrorSummary` brukes i alle lange skjemaer (gjenbruk på tvers av filer).
- `ListingCard` brukes i søk, på Min side og i forhåndsvisningen. Én komponent betyr at
  forhåndsvisningen viser nøyaktig det kjøperen vil se.

**Hvorfor ikke én stor komponent:** kurset starter med én komponent (RR/06), men den har to felt.
Vårt skjema har sju felt, opptil ti bilder og pris som avhenger av type, og bildeopplastingen har sin
egen tilstand. Én stor komponent ville samlet flere ansvar, gjort testing av bildegrensene vanskelig
og gitt dobbel kode for kortet.

**Hvorfor ikke dele alt (egen TypePicker, PriceField og så videre):** de brukes bare i dette skjemaet
og har ingen egen logikk utover feltene. Egne filer ville gitt flere props å sende uten gevinst
(for tidlig abstraksjon, RR/10:1697).

## Annonsesider (WF-03, WF-04)

- Siden er en tynn serverkomponent som henter data og setter sammen delene.
- `ListingCard` er egen fil og tar ett annonseobjekt som prop (som PostCard, KI/05:609-612), fordi den
  brukes i søk, på Min side og i forhåndsvisningen. Bygget 07.10 (#79): bilde-plassholder, tittel og
  «type · pris» fra `format-type-and-price.ts`; norske navn fra `listings/labels.ts`. Hele kortet lenker til annonsesiden (#91).
- Detaljsiden er én side med seksjoner som avhenger av handelstype; lån er «som salg, pluss» kalender.
- Annonsesiden (#91, 08.10): `ListingPage` henter annonsen med `getListingWithOwner` og velger visning;
  `ListingDetails` viser innholdet og `ListingGone` borte-visningen. `ImagePlaceholder` er delt mellom kortet og
  siden til bildene kommer (#61). `formatPrice` gir prisen alene, og `formatTypeAndPrice` bygger på den.
- Søket (#97, 10.10): `SearchField` er et vanlig GET-skjema uten klientkode. `HomePage` validerer `?q=` med
  `parseSearch`, henter aktive annonser med `getActiveListings` og rangerer dem med `searchListings` (Fuse.js).
  `SearchNotice` er den stiplede boksen for ingen treff og ugyldig søk.
- Live søkeforslag (#104, 10.10): `SearchField` er nå klientkomponent (combobox etter WAI-ARIA), men rendres
  ferdig på serveren og virker uten JavaScript. `useSuggestions` henter fra `GET /api/listings` 200 ms etter
  siste tastetrykk og avbryter eldre forespørsler; `suggestions.ts` har den rene logikken (når hente, piltaster).
- Filtrene (#102, #122, 10.10): `Filters` er klientkomponent. Valgene er kontrollert state som settes fra serveren
  når siden kommer tilbake, og hvert valg kaller `navigate` fra `rwsdk/client`: siden hentes på nytt uten full
  omlasting, og fokus blir stående. Feltene hører til søkeskjemaet via HTML-attributtet `form="listing-search"`, så
  Enter og «Søk» sender alt, også uten JavaScript. `filter-listings.ts` har den rene logikken: `matchesFilters`
  for annonselisten og `availableOptions` for de grå opsjonene, begge kjørt på serveren etter søket.
  `search-limits.ts` har grensene klientkoden trenger, så Zod og databaseskjemaet ikke havner i nettleseren.
- Interaktive deler (bildegalleri, kalender) er små klientkomponenter.

**Hvorfor:** dette er mønsteret fra leksjon 8 og 19 (en side som koordinerer, deler med ett ansvar)
og fra KI-kurset: hold så mye som mulig på serveren, og gjør bare de interaktive delene til klient
(KI/05:54). Det gir mindre JavaScript i nettleseren, og datahenting og tilgangssjekk skjer på serveren.
Ett annonseobjekt som prop gir ett sted å utvide kortet (KI/05:609-612).

**Hvorfor ikke tre detaljsider (salg, lån, gis bort):** de deler galleri, tittel, beskrivelse og
eierinfo; bare handlingen og kalenderen skiller dem. Tre sider ville kopiert det felles og latt
sidene gli fra hverandre, samme problem som med knappene.

**Hvorfor kortet er egen fil, når kursets liste skriver kortene rett i siden (RR/19:1030-1125):**
der brukes kortet ett sted. Vårt brukes tre steder, så det treffer gjenbruksregelen.

Kode legges i funksjonsmappen `app/src/app/listings/`, som `auth/`. Mappestrukturen vokser når
skjermene bygges; den lages ikke på forhånd.

## Ikke bygg

- Komponentbibliotek (for eksempel shadcn/ui) eller `class-variance-authority`/`tailwind-merge` for tre
  varianter; et vanlig oppslagsobjekt holder.
- Konfigurerbare «alt-i-ett»-komponenter med mange av/på-props (RR/10-konfigurerbare-komponenter.md:1679).
- Tre separate detaljsider eller tre skjemaer for salg, lån og gis bort.
- Global state eller Context for skjemaer; props og callbacks holder til drilling blir et faktisk problem.

## Åpne beslutninger som stopper byggingen

Bildelagring (#61), utvidet kategoriliste (#62), tilstandsverdier (#63) og detaljside for «gis bort» (#64).
