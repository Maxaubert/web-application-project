# To-do: nåstatus og neste arbeid

**Sist oppdatert 19.09.2026.** Dette er den aktive oppgavelisten frem til vi tar i
bruk GitHub Issues og Kanban. Ti planleggingstemaer betyr ikke ti separate filer.
Utført dokumentarbeid og ferdig avklart produkt er forskjellige milepæler.

## Utført og dokumentert

- [x] Opprettet privat web-repo med kursgrunnlag, assistentveiledning og planleggingslister.
  Grunnlaget er merget i [prosjektgrunnlags-PR-en](https://github.com/Maxaubert/web-application-project/pull/1).
- [x] Skrevet [kravspesifikasjon](kravspesifikasjon.md) og separat [teknisk plan](docs/teknisk-plan.md).
  Kravspekken inneholder AK-01–AK-29; begge dokumentene har fortsatt åpne valg.
- [x] Dokumentert Max' MVP-valg: salg, gratis lån og betalt leie, forespørsler/motforslag,
  eierbekreftet retur, chat senere og betaling utenfor appen. Emils gjennomgang gjenstår.
- [x] Undersøkt Feide i dokumentasjonen. Max har valgt det bort som løsning for prosjektet;
  alternativ innlogging og studentverifisering er ikke valgt. Se teknisk plan.
- [x] Hentet [lærerens KI-avtale](docs/ki-avtale-canvas.md) fra Canvas og skilt den fra
  [gruppens ubekreftede utkast](KI-AVTALE.md). Kildekopien ligger i den åpne
  [KI- og fremdrifts-PR-en](https://github.com/Maxaubert/web-application-project/pull/2).
- [x] Opprettet [felles arbeidslogg](arbeidslogg-max-og-emil.md) og [timeliste](timeliste.md).
  Loggen er etterført fra kjente hendelser; ingen timer er oppgitt eller registrert.

## Neste konkrete oppgaver

- [ ] Max og Emil gjennomgår MVP, krav og åpne regler sammen (F01/F04–F06).
- [ ] Velg alternativ innlogging og avklar hvordan målgruppen verifiseres (F08/F09/F11).
- [ ] Avklar reservering, datogrenser, avbestilling og salgsfullføring (F06).
- [ ] Fyll inn og bekreft gruppe-/KI-avtale, faktisk kapasitet og arbeidsdeling (F13).
- [ ] Registrer egne faktiske timer dersom tidligere økter skal etterføres. Ukjent er ikke null.
- [ ] Flytt åpne oppgaver til Issues og Kanban når dere er klare (F14). Bevar F-/G-ID-er
  og legg inn lenker her; unngå to parallelle aktive oppgavelister.

## De ti planleggingstemaene

Temaene står åpne til hele resultatet er gjennomgått av begge. Fremdriften står i teksten.

- [ ] **Problem og målgruppe:** beskriv studentenes behov, faktiske brukerinnspill og
  hvorfor de vil bruke tjenesten. Avklar prosjektets begreper med Emil. (F01–F03)
- [ ] **MVP og avgrensning:** definer første nyttige versjon, én komplett brukerreise,
  hva som er med og hva som utsettes. Behold alle tre handelstyper, chat senere;
  avklar eventuell hjelp/opplæring og gjenstående regler. (F04)
- [ ] **Kravspesifikasjon:** skriv funksjonelle krav, kvalitetskrav, designkrav og tekniske
  rammer. Utkast finnes; avklar åpne valg og gjennomgå sammen. (F05)
- [ ] **Akseptansekriterier:** gjør kravene etterprøvbare med Gitt/Når/Så, inkludert
  suksess, ugyldig input, manglende innlogging og feil eier. AK-01–AK-29 finnes;
  gjennomgå kriteriene og lukk avhengige regelvalg. (F05/F12)
- [ ] **Forretningsregler:** avklar tidsperioder, tilgjengelighet, godkjenning, henting,
  retur og avbestilling. Eierbekreftet retur og oppgjør utenfor appen er avklart av Max;
  reservering, salgsfullføring og øvrige regler gjenstår. (F06)
- [ ] **Prioritering:** lag Må/Bør/Kan/Ikke nå og en begrunnet kuttliste. Vurder rekkevidde,
  nytte, sikkerhet i antakelsene og innsats; bruk RICE bare med meningsfulle estimater. (F07)
- [ ] **Risiko og personvern:** dokumenter største usikkerheter, nødvendige undersøkelser,
  eksterne avhengigheter og hvilke data som lagres, deles og slettes. (F08/F11)
- [ ] **Teknisk plan og designskisser:** velg stack, skisser datamodell, API, tilgang og
  server-/klientgrenser, samt hovedskjermer og feil-/tomtilstander. Begrunn alternativene. (F09/F10)
- [ ] **Testplan:** knytt kriteriene til enhetstester, integrasjonstester og E2E. Beskriv
  testdata og manuell kontroll av tastatur, mobilvisning og høy zoom. Koblingstabell
  finnes i teknisk plan; testmiljø, testdata og apptester finnes ikke ennå. (F12, G13–G16)
- [ ] **Arbeids- og leveranseplan:** avtal roller, review og KI-bruk, del arbeidet i issues,
  prioriter Kanban-backloggen og sett milepæler med tid til testing og læring. (F13–F15)

## Detaljer og videre oppgaver

F-ID-ene viser til [før-bygg-listen](docs/for-bygg-start.md), som beskriver rekkefølge,
avklaringer og hva som skal produseres. G-ID-ene viser til [GitHub-oppsettet](docs/github-repo-oppsett.md):
PR-regler, CI/CD, tester, README, dokumentasjon og senere logo, badges og trailer.

Etter hver meningsfull økt: oppdater status og neste handling her, legg resultat og
beslutninger i arbeidsloggen, og før timer bare når deltakeren oppgir dem. Skill
utkast, kontrollert artefakt, gruppeavklart, implementert og verifisert. Lenke til en
åpen PR betyr at arbeidet er tilgjengelig på branchen, ikke at det er merget.

Når Issues og Kanban overtar: legg inn boardlenken, migrer gjenstående punkter med
ID-er og bevis, og merk denne listen som arkiv. Arbeidslogg og timeliste fortsetter.
