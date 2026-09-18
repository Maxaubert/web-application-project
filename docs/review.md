# Lokal oppgave og PR-utkast

**Lokal oppgave:** etabler et kildebasert prosjektgrunnlag for Max og Emil i ITF31619
26H, med AI-veiledning, kravsporbarhet, samarbeid, egen læring og reell docsverifikasjon.
Dette er bestilt arbeid. Valg av appidé og appimplementering er utenfor denne endringen.

Repo: `web-application-project`. Branch: `feat/course-foundation`.
Ingen remote eller faktisk GitHub-issue/PR finnes. Intet er merget.
En reell PR krever senere fullmakt til remote/opplasting og en avtalt basebranch.
Det nye repoet har foreløpig ingen eksisterende hovedbranchhistorikk å sammenligne med.
Ikke lag en kunstig studenthistorikk eller flytt endringen direkte til main for å løse det.

## Foreslått PR-tittel

`docs(course): etabler kildebasert grunnlag for Webapplikasjoner 26H`

## PR-beskrivelse

Max og Emil trenger et felles startpunkt som beholder gjeldende emnekrav og støtter
faktisk forståelse av egen app. Endringen legger til et norsk dokumentasjonsgrunnlag
med felles AGENTS/CLAUDE-veiledning, kilde-/kravoversikt, prosjektkort, avtaleutkast,
teknisk sjekkliste, autentisk loggmal, læringskart og leveransekontroll.
Et diskusjonsnotat bevarer kandidatideer, brukerens preferanser og åpne spørsmål før teamet velger.

Canvas-krav er kontrollert 14.09.2026 og skilles fra undervisningsøvinger, historiske
råd og teamstandarder. Idé, arkitektur og studentenes refleksjoner er ikke fylt ut.
Dokumentasjon er laget med Codex og tilskrives ikke studentene som egen innsats.

En Node-kontroll verifiserer struktur, lokale lenker og utvalgte beskyttelsesregler,
med begrenset personvernkontroll. Resultater og uavhengig kritikk dokumenteres i
[verifikasjonsloggen](verifikasjon.md). Det finnes ingen app, apptester, dekningsprosent
eller deploy å påstå fungerer.

## Akseptansekriterier for denne endringen

- [x] Krav kan spores til gjeldende kilder, og usikkerheter er synlige.
- [x] AGENTS/CLAUDE er korte og deler regler uten to divergerende kopier.
- [x] Ingen valgt appidé, falske studentbidrag eller besvarelser av beskyttet egenarbeid.
- [x] README og lokal kontroll virker uten å ha School-arkivet installert.
- [x] Uavhengig kritikk er mottatt, vurdert og relevante rettinger verifisert.
- [x] Diff og begrenset personvernkontroll er gjennomført. School og eksisterende prosjekter er ikke endret.

Uavhengig review 14.09.2026: alle 20 filer og sentrale primærkilder lest, ingen
vesentlige blokkere. To presiseringer om KI-forberedelse og Claude `/context` er rettet.
Kontrolljournalen viser resultat og begrensninger; fokusert etterkontroll av rettingene
er bestått uten nye funn 14.09.2026. Dette er teknisk dokumentreview, ikke
studentenes godkjenning av avtaler eller lærerens godkjenning av arbeidskrav.

Senere autorisert notattillegg 14.09.2026: [ideer til diskusjon](ideer-til-diskusjon.md)
bevarer Max' to kandidater og avviste ideer, med åpne spørsmål og tydelig merkede
assistentforslag. README/prosjektkort lenker dit, og validatorens filliste er oppdatert.
Dette enkle notattillegget er kontrollert lokalt, ikke omfattet av den tidligere
uavhengige kritikken. Ingen idé eller teamavtale er vedtatt.

Akseptansekriteriene gjelder repo-grunnlaget, ikke godkjente arbeidskrav eller eksamen.
Etter godkjent remote kan teksten brukes i faktisk issue/PR. Stopp før merge og be
Ove godkjenne den konkrete PR-en. Ingen godkjenning er gitt ved å bestille dette grunnlaget.

## Tillegg 16.09.2026: plan for repo og byggestart

Brukerbestilling: dokumenter fremtidig GitHub-oppsett og en prioritert før-bygg-liste,
basert på lærerens kilder og merkede assistentforslag. Ikke konfigurer eller bygg noe.
Ny arbeidsbranch er `codex/repo-setup-plan`. Repoet hadde ingen commits; de 21 tidligere
staged grunnlagsfilene er bevart. Ingen basebranch, remote eller faktisk PR finnes ennå.

Foreslått tilleggstittel: `docs(plan): legg til repo-oppsett og før-bygg-sjekkliste`.
To nye dokumenter dekker avklaringer, prioritering, issues/board, PR-review, CI/CD,
teststrategi, dokumentasjon og senere logo/badges/trailer. README lenker til begge.
Krav, undervisning, teamforslag og presentasjonspolering skilles eksplisitt.
Emnekravene bygger på den tidligere Canvas-kontrollen, ikke en ny live-kontroll.
Den historiske lærertranskripsjonen og relevant 2026-undervisning er lest på nytt.

Kontroll og uavhengig review føres i [verifikasjon](verifikasjon.md). Dette tillegget
implementerer ingen appfunksjon eller GitHub-innstilling. Ingen publisering/merge er utført.
