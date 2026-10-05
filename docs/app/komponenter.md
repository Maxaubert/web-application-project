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

## Delt UI i `app/src/app/shared/`

| Komponent | Ansvar | Status |
|---|---|---|
| `Button` | Varianter `primary`, `secondary`, `link`; innebygd `type`, ventetilstand, `disabled` og `aria-busy`, 44 px og fokusring. Ingen `size`/`icon`-props. | Planlagt (#66). Erstatter `PrimaryButton` og kopierte klasser. |
| `TextField`, `FieldError` | Etikett, felt og feilmelding koblet med id-er. | Finnes (`form-controls.tsx`). |
| `TextArea`, `SelectField` | Samme mønster som `TextField`; kurset anbefaler egne input/select-komponenter (RR/08:288-290). | Lages med «Legg ut annonse». |
| `ErrorSummary` | Feiloppsummering øverst i lange skjemaer, med lenker til feltene. | Lages med «Legg ut annonse». |
| `PageShell` | Topplinje og sideramme. Trenger et bredt oppsett for søk og detalj. | Finnes, smalt (#65). |

**Button, begrunnelse:** kurset viser en variant-`Button` (RR/04-valg-rammeverk.md:553-597) og en
privat knapp med fargekart (RR/11-tailwind-v4.md:499-612), men eksempelappen har ingen delt knapp.
Avgjørende for oss: knappene våre hadde allerede glidd fra hverandre (ventetilstand kopiert tre steder,
`aria-busy` manglet på to). **Alternativet som ble valgt bort** (Emils syn): rå `<button>` med delte
klassekonstanter, nærmere kursets eksempelapp, men med risiko for at `type` og `aria-busy` glemmes.

## «Legg ut annonse» (WF-05)

Ett `ListingForm` eier skjemaet og `useActionState`, og brukes både til å opprette og redigere
(RR/19-server-actions-forms.md:353-377). Skilles ut fordi de har eget ansvar eller gjenbrukes:

- `ImageUploader`: egen state for forhåndsvisninger, legg til/fjern og grensen 1–10 bilder.
- `ErrorSummary`: delt, se over.
- Forhåndsvisning på desktop: gjenbruker `ListingCard` fra søket.

Typevelger og prisfelt blir i `ListingForm` til de trengs andre steder. Prisreglene (heltall ≥ 0,
ukepris valgfri ved lån) testes i en egen funksjon ved siden av `shared/loanPrice.ts`.
**Alternativet som ble valgt bort:** én stor komponent med alt (RR/06), fordi skjemaet har sju felt,
opptil ti bilder og pris som avhenger av type.

## Annonsesider (WF-03, WF-04)

- Siden er en tynn serverkomponent som henter data og setter sammen delene.
- `ListingCard` er egen fil og tar ett annonseobjekt som prop (som PostCard, KI/05:609-612), fordi den
  brukes i søk, på Min side og i forhåndsvisningen.
- Detaljsiden er én side med seksjoner som avhenger av handelstype; lån er «som salg, pluss» kalender.
- Interaktive deler (søkefilter, bildegalleri, kalender) er små klientkomponenter.

Kode legges i funksjonsmappen `app/src/app/listings/`, som `auth/`. Mappestrukturen vokser når
skjermene bygges; den lages ikke på forhånd.

## Ikke bygg

- Komponentbibliotek (for eksempel shadcn/ui) eller `class-variance-authority`/`tailwind-merge` for tre
  varianter; et vanlig oppslagsobjekt holder.
- Konfigurerbare «alt-i-ett»-komponenter med mange av/på-props (RR/10-konfigurerbare-komponenter.md:1679).
- Tre separate detaljsider eller tre skjemaer for salg, lån og gis bort.
- Global state eller Context for skjemaer; props og callbacks holder til drilling blir et faktisk problem.

## Åpne beslutninger som stopper byggingen

Bildelagring (#61), kategoriliste (#62), tilstandsverdier (#63), detaljside for «gis bort» (#64) og
bredt sideoppsett (#65).
