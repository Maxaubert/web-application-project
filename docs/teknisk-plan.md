# Teknisk plan for studentmarkedet

**Utkast 19.09.2026. Ingen app eller endelig arkitektur er implementert.**
[Kravspesifikasjonen](../kravspesifikasjon.md) eier produktets oppførsel og omfang.
Dette dokumentet skal beskrive hvordan den oppfylles. [Teknikk](teknikk.md) er den
generelle faglige sjekklisten, ikke en parallell apparkitektur.

## Beslutninger som må tas

| Område | Nåværende status | Neste avklaring |
|---|---|---|
| Rammeverk og språk | Ingen endelig stack valgt | Velg innenfor T01 i [emnekrav](emnekrav.md), og begrunn valget. |
| Styling | Max ønsker moderne verktøy, eksempelvis Tailwind CSS | Velg sammen med stacken; verktøyet erstatter ikke designkravene. |
| Database og ORM | Eget skjema kreves, løsning ikke valgt | Følg T02; modeller alle tre handelstyper og avtaleflyten. |
| Innlogging | Feide ønskes, tilgang ikke bekreftet | Undersøk registrering, testbrukere og institusjonsaktivering før valg låses. Alternativ er ikke valgt. |
| Hosting | Ikke valgt | Avklar etter stack, tilgang og budsjett. Ingen deploy er bestilt her. |
| API og skrivehandlinger | Ikke designet | Knytt T03/T04 til konkrete handlinger med input, svar, feil og eierskap. |

## Datamodell og requestflyt som skal konkretiseres

Begreper å modellere, **ikke vedtatte tabeller**: bruker, annonse/ting, handelstype,
forespørsel, foreslåtte vilkår, motforslag og godtatt avtale. Lån og leie har perioder;
salg har ikke returperiode. Prisberegning, tilgjengelighet og fullføring må avklares i
kravspesifikasjonen før datamodellen låses.

Foreslått gjennomgang av hver skrivehandling:

1. Skjemaet sender valgt handling og input til serveren.
2. Serveren kontrollerer sesjon, hvem som er eier/forespørrer, og hvem som kan svare nå.
3. Valider input og om forslaget fortsatt er gjeldende.
4. Kontroller tilgjengelighet og lagre resultatet slik at samtidige svar ikke omgår reglene.
5. Vis lagret status og gjeldende vilkår til de to partene, eller en forståelig feil.

Dette er et implementeringsforslag, ikke ferdig kode. Eksakte ruter, komponentgrenser,
tabeller og mekanismen for samtidighet bestemmes etter stack- og regelavklaringen.
Ingen chatkomponent eller betalingsintegrasjon skal bygges som del av MVP.

## Feide: undersøkelse før implementering

Offisielle kilder undersøkt 19.09.2026:

- [Feide-oversikt](https://docs.feide.no/general/feide_overview.html): OIDC-tjenester kan også registreres av personlige brukere. Gruppens egen tilgang er ikke prøvd.
- [Integrasjon og test](https://docs.feide.no/service_providers/getting_started/add_feide_login.html): en registrert tjeneste kan testes før publisering.
- [Institusjonsaktivering](https://docs.feide.no/service_providers/manage/access_to_services/activation.html): institusjonen må aktivere tjenesten før dens brukere får tilgang.

Avklar med relevant administrator hvordan HiØ vil støtte prosjektet. Ingen henvendelse
er sendt, konto opprettet eller registrering gjort. Undersøk også hvilke identitetsdata
som faktisk kan bekrefte valgt målgruppe; innlogging og studentstatus er forskjellige spørsmål.

## Testplan og kobling til emnet

| Bevis som skal planlegges | Grunnlag |
|---|---|
| Hovedflyt for salg, gratis lån og betalt leie, med lagret resultat etter ny innlogging | FK-01–FK-06, AK-01–AK-23, T05/T06 |
| Eier godtar/avslår/justerer; riktig student godtar/avslår motforslag | TK-03/TK-07, AK-12/AK-13/AK-18–AK-20 |
| Samtidig godkjenning av overlappende leieavtaler tillater høyst én | TK-06; AK-14 alene tester bare sekvensiell godkjenning |
| Avvist tilgang etterlater lagringen uendret | TK-03/TK-07, T04 |
| Foreslåtte tillegg: foreldet motforslag, tapt svar og ny innsending uten doble handlinger | Gjennomgå reglene før nye kriterier fastsettes |
| REST-kontrakt med relevant metode, status og feilsvar | T03 |
| Vitest-integrasjon av hovedflyt og minst 50 % dekning, med avklart målegrunnlag | T07 |
| Playwright av hovedflytene og manuell kontroll av tilgjengelighet | Teamstandard i [GitHub-plan](github-repo-oppsett.md) |
| Reproduserbare kommandoer og nødvendig konfigurasjon uten hemmeligheter | T08, [README](../README.md) |

Testsuiten, kommandoene og miljøet finnes ikke ennå. Emnekrav bygger på sist kontrollerte
kurskilder i [kildeindeksen](kilder.md); ingen ny Canvas-kontroll er utført her.

## Neste planlegging

Avklar reglene, velg stack, tegn datamodell og kontrakter, og bryt første komplette flyt
ned i små oppgaver. Bruk [prosjektplanen](prosjekt.md) og [TODO](../TODO.md) til arbeidsdeling.
For hvert vesentlig valg: noter alternativ, begrunnelse, kostnad og hva som ville endret valget.
Studentenes beskyttede arkitekturbegrunnelse i rapporten skal fortsatt skrives av dem selv.
