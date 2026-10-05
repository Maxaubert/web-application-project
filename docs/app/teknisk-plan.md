# Teknisk plan for studentmarkedet

**Oppdatert 20.09.2026. Appgrunnlag finnes; produktarkitekturen er fortsatt utkast.**
[Kravspesifikasjonen](../krav/kravspesifikasjon.md) eier produktets oppførsel og omfang.
Dette dokumentet skal beskrive hvordan den oppfylles. [Teknikk](teknikk.md) er den
generelle faglige sjekklisten, ikke en parallell apparkitektur.

## Beslutninger som må tas

| Område | Nåværende status | Neste avklaring |
|---|---|---|
| Rammeverk og språk | RedwoodSDK 1.7.3, React, Vite og TypeScript satt opp etter Max sin bestilling | [Oppsett og versjoner](oppsett.md); studentenes egen begrunnelse gjenstår. |
| Styling | Tailwind CSS v4, valgt av Max 05.10 (som React-kurset leksjon 11) | Farger og typografi fra wireframes ligger som tema i `app/src/app/styles.css`. |
| Database og ORM | Drizzle og lokal D1. Første migrasjon har innloggingstabellene (#47) | Annonse- og forespørselstabeller designes i neste del (T02). |
| Innlogging | Engangskode på e-post med better-auth, bygget 05.10 (#47). Feide valgt bort | Ekte e-postutsending og domene (#46). Se «Innlogging» under. |
| Hosting | Ikke valgt | Avklar etter stack, tilgang og budsjett. Ingen deploy er bestilt her. |
| Komponenter | Prinsipper og plan valgt av Max 05.10 | [Komponenter](komponenter.md); åpne beslutninger #61–#65. |
| API og skrivehandlinger | Ikke designet | Knytt T03/T04 til konkrete handlinger med input, svar, feil og eierskap. |

## Datamodell og requestflyt som skal konkretiseres

Begreper å modellere, **ikke vedtatte tabeller**: bruker, annonse/ting, handelstype,
forespørsel, foreslåtte vilkår, motforslag og godtatt avtale. Lån og leie har perioder;
salg har ikke returperiode. Eieren alene bekrefter mottatt retur og fullfører lån/leie.
Prisberegning, tilgjengelighet og salgsfullføring må avklares i kravspesifikasjonen
før datamodellen låses. Bruk livsløpstabellen der som grunnlag for gyldige tilstandsoverganger.

Foreslått gjennomgang av hver skrivehandling:

1. Skjemaet sender valgt handling og input til serveren.
2. Serveren kontrollerer sesjon, hvem som er eier/forespørrer, og hvem som kan svare nå.
3. Valider input og om forslaget fortsatt er gjeldende.
4. Kontroller tilgjengelighet og lagre resultatet slik at samtidige svar ikke omgår reglene.
5. Vis lagret status og gjeldende vilkår til de to partene, eller en forståelig feil.

Dette er et implementeringsforslag, ikke ferdig kode. Eksakte ruter, komponentgrenser,
tabeller og mekanismen for samtidighet bestemmes etter stack- og regelavklaringen.
Ingen chatkomponent eller betalingsintegrasjon skal bygges som del av MVP.

## Innlogging (#47, valgt av Max 05.10.2026)

Studenten skriver HiØ-e-posten, får en sekssifret kode og logger inn med den. Koden beviser
at studenten eier adressen, og appen lagrer ingen passord. Valgene og begrunnelsene kom fra
en gjennomgang med Claude Code der Max forsvarte hvert valg.

| Valg | Hvorfor |
|---|---|
| Bare kode, ingen lenke | Microsoft Safe Links hos HiØ kan åpne og bruke opp engangslenker før studenten klikker. |
| 6 sifre, 5 min, 3 forsøk | better-auth sine standardverdier; liten gjettesjanse per kode. |
| 5 koder per adresse per time, 60 s mellom | Uten taket kan en angriper be om nye koder i det uendelige. better-auth teller bare per IP, så vi teller per adresse selv i D1 (en hash av adressen, ikke adressen). |
| Domenesjekk også i better-auth sin hook | Noen kan kalle `/api/auth/*` direkte og hoppe over skjemaet. |
| Økt i 30 dager, rullerende | Praktisk på egen telefon. Risikoen på delte PC-er dempes med synlig «Logg ut» som sletter økten på serveren. |
| Telefon med land, libphonenumber-js | Utvekslingsstudenter har ofte utenlandsk nummer. Lagres som E.164. |
| Logger med maskert e-post | Nok til feilsøking uten å lagre personopplysninger i loggen (GDPR: dataminimering). |

Koden ligger i `app/src/app/auth/` (funksjonsmappe). Andre deler importerer bare `guards.ts`
(`requireUser`) og `session.ts`. Lokalt skrives koden til terminalen og nettleserkonsollen; ekte
e-post er #46. Konsollvisningen er en bevisst lokal bakdør (Max 05.10): bare `printLoginCode`, som
brukes når `LOGIN_CODE_DELIVERY=log` i `.dev.vars`, husker koden. I produksjon husker ingenting den.
Lås nummer to: `getDevCode` gir bare koden under utviklingsserveren (`import.meta.env.DEV`, satt
ved bygging), så et produksjonsbygg aldri sender den til nettleseren, uansett innstilling.
Ved deploy må `BETTER_AUTH_SECRET` settes som hemmelighet og `baseURL` settes.

## Vurdert alternativ: Feide

**Beslutning oppgitt av Max 19.09.2026:** Feide er ikke riktig løsning for prosjektet
og velges bort. Undersøkelsen nedenfor er dokumentgrunnlaget, ikke en påstand om
at Feide er teknisk umulig eller at HiØ har avslått tilgang. Detaljert begrunnelse
for valget er ikke oppgitt. Se 19.09 i [arbeidsloggen](../prosess/arbeidslogg-max-og-emil.md).

Offisielle kilder undersøkt 19.09.2026:

- [Feide-oversikt](https://docs.feide.no/general/feide_overview.html): OIDC-tjenester kan også registreres av personlige brukere. Gruppens egen tilgang er ikke prøvd.
- [Integrasjon og test](https://docs.feide.no/service_providers/getting_started/add_feide_login.html): en registrert tjeneste kan testes før publisering.
- [Institusjonsaktivering](https://docs.feide.no/service_providers/manage/access_to_services/activation.html): institusjonen må aktivere tjenesten før dens brukere får tilgang.

Ingen henvendelse er sendt, konto opprettet eller registrering gjort, og ingen praktisk
Feide-integrasjon er prøvd.

**Kontrollert på nytt 05.10.2026:** Feide krever to godkjenninger vi ikke styrer. Sikt vurderer
en søknad før tjenesteleverandøren får tilgang ([kundeportal](https://docs.feide.no/service_providers/getting_started/customer_portal.html)),
og HiØ må selv aktivere tjenesten før studentene kan logge inn
([aktivering](https://docs.feide.no/service_providers/manage/access_to_services/activation.html)).
Ingen behandlingstid er oppgitt. Testbrukere finnes, men er ikke ekte studenter. Med frist
5. november er det ikke realistisk. Engangskode til `@hiof.no` løser både innlogging og
verifisering av HiØ-tilknytning.

## Testplan og kobling til emnet

| Bevis som skal planlegges | Grunnlag |
|---|---|
| Hovedflyt for salg, gratis lån og betalt leie, med lagret resultat etter ny innlogging | FK-01–FK-07, AK-01–AK-29, T05/T06 |
| Eier godtar/avslår/justerer; riktig student godtar/avslår motforslag | TK-03/TK-07, AK-12/AK-13/AK-18–AK-20/AK-24/AK-25 |
| Eier fullfører lån/leie ved mottatt retur; feil aktør, ugyldig status og lagringsfeil endrer ikke avtalen | FK-07, AK-26–AK-29 |
| Samtidig godkjenning av overlappende leieavtaler tillater høyst én, både ved direkte aksept og aksept av motforslag | TK-06; AK-14 alene tester bare sekvensiell godkjenning |
| Avvist tilgang etterlater lagringen uendret | TK-03/TK-07, T04 |
| Foreslåtte tillegg: foreldet motforslag, tapt svar og ny innsending uten doble handlinger | Gjennomgå reglene før nye kriterier fastsettes |
| REST-kontrakt med relevant metode, status og feilsvar | T03 |
| Vitest-integrasjon av hovedflyt og minst 50 % dekning, med avklart målegrunnlag | T07 |
| Playwright av hovedflytene og manuell kontroll av tilgjengelighet | Teamstandard i [GitHub-plan](../arkiv/github-repo-oppsett.md) |
| Reproduserbare kommandoer og nødvendig konfigurasjon uten hemmeligheter | T08, [README](../../README.md) |

Starterens testmiljø og kommandoer finnes i [README](../../README.md). Produktets tester
og hovedflytintegrasjon finnes ikke ennå; scaffoldtester oppfyller ikke T07. Emnekrav bygger på sist kontrollerte
kurskilder i [kildeindeksen](../emne/kilder.md); ingen ny Canvas-kontroll er utført her.

## Neste planlegging

Avklar reglene, velg stack, tegn datamodell og kontrakter, og bryt første komplette flyt
ned i små oppgaver. Bruk [prosjektplanen](../arkiv/prosjekt.md) og [Kanban-boardet](https://github.com/users/Maxaubert/projects/1) til arbeidsdeling.
For hvert vesentlig valg: noter alternativ, begrunnelse, kostnad og hva som ville endret valget.
Studentenes beskyttede arkitekturbegrunnelse i rapporten skal fortsatt skrives av dem selv.
