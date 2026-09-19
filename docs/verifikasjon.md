# Verifikasjon av dokumentasjonsgrunnlaget

Dette dokumentet skiller faktisk gjennomført kontroll fra fremtidige appgater.
Det er **ikke en sikkerhetsrevisjon**, karaktervurdering eller attest på studentenes arbeid.

## Kjør lokalt

Fra repo-roten, Node.js 22+ og Git:

```powershell
node scripts/verify-docs.mjs
git diff --check
git diff --cached --check
```

Ingen avhengigheter eller nettverk kreves. Kjør også etter at filer er staged.
`git diff --check` alene kontrollerer ikke untracked filer; Node-kontrollen tar med
sporede og ikke-ignorerte untracked filer. Den krever ikke søsterrepoet School.

## Hva kontrollen gjør

- Kontrollerer at prosjektets sentrale filer og krav-ID-rader finnes.
- Kontrollerer vanlige relative Markdown-lenker utenfor kodeblokker innenfor repoet.
- Kontrollerer 200-linjersgrense i AGENTS/CLAUDE og CLAUDE-importen.
- Søker etter utvalgte formuleringer som beskytter kjent kritisk veiledning.
- Validerer kilde-ID, kontrolldato og hash-format i manifestet, uten å lese kursarkivet.
- Flagger visse hemmelighetsmønstre og uønskede kilde-/nøkkelfiler i Git-utvalget.
- Avviser em dash og tekstfiler større enn kontrollgrensen.

## Begrensninger

Tekstkontroll beviser ikke at en regel er faglig riktig, at kilder fortsatt er gjeldende,
eller at en assistent følger den. Formuleringskontroller er vedlikeholdspunkter, ikke
semantisk analyse. Ved legitim omskriving må kontroll og dokument vurderes sammen.
Scriptet tolker ikke all Markdown-syntaks, sjekker ikke eksterne lenker, og lokale
ankere må ha eksplisitt HTML-id. Det kjører ingen app og måler ingen testdekning.

Personvernsjekken er begrenset: ingen full historikk-/binær-/OCR-/høyentropiskanning,
ingen inspeksjon av ignorerte filer, og ingen garanti for å finne alle persondata eller
hemmeligheter. Før publisering må mennesker lese den faktiske diffen og historikken.
En kontroll av arbeidsfilene er ikke bevis på at staged versjon er identisk; kontroller
`git status` og staged diff før commit. .gitignore fjerner aldri allerede sporet innhold.

Manifestet identifiserer lest kildeversjon, men validatoren sammenligner ikke hash med
Canvas eller School. Oppdatering av krav krever [kilderutinen](kilder.md).
Live innlasting i en ny assistentsesjon og visuell Markdown-rendering er separate kontroller.

## Kontrolljournal

| Kontroll | Status |
|---|---|
| Canvas K01/K02 og 12 kunngjøringer | Lest med kursavgrensede API-kall 14.09.2026; ingen personlige vurderingsdata lest |
| U26 kravsider og utvalgte historiske kilder | Lest av hovedagent/kildeagent; presise referanser i kildeindeksen |
| Struktur, lenker, kritisk tekst og begrenset personvernkontroll | Bestått 14.09.2026: 20 Git-filer, 20 tekstfiler, 57 lokale lenker |
| Negative prøver av validatoren i isolert kopi | Bestått 14.09: brutt lenke, syntetisk tokenmønster, fjernet egen-test-regel, fjernet CLAUDE-import og force-added .env ble alle avvist |
| Diff/filoversikt, ingen remote | Staged og arbeidsdiff bestått 14.09; 20 filer staged på feat/course-foundation, ingen commit eller remote |
| Uavhengig kritikk av ferdig grunnlag | Gjennomført 14.09; alle 20 filer, sentrale Canvas-kilder, U26-hash og historiske sitatsteder kontrollert. To små presiseringer rettet; fokusert etterkontroll bestått uten nye funn |
| App, build, Vitest, dekning, Playwright og CI | Ikke aktuelt ennå, ingen app finnes |
| Studentenes egen forståelse/avtaletilslutning | Ikke prøvd/ikke gitt |

Uavhengig kritiker fant ingen vesentlige blokkere. KI er tillatt i forberedelsen til
lyntale, mens svar under vurdering må gis uten KI; ordlyden i leveransekontrollen er
presisert. Claude Code viser faktisk lastede instruksjonsfiler med `/context`, mens
`/memory` brukes til å finne/åpne kilder; assistentveiledningen er korrigert.

Kritikeren kjørte også sju egne negative prøver: manglende fil, brutt lenke, lenke
utenfor repo, manglende CLAUDE-import, syntetisk tokenmønster, force-added .env og feil
kurs-ID. Alle ble fanget. Kritikeren endret ikke repoet eller Git. Verken live innlasting
i ny Codex-/Claude-sesjon, Markdown-rendering eller live Notion-spørsmålsbank ble prøvd.

Ved fokusert etterkontroll leste kritikeren rettingene og hele review-/verifikasjonsloggen,
kjørte validator og begge diffkontroller på nytt, og bekreftet at arbeidsfiler og staging
var like. Sluttføringen endret deretter bare disse to filenes reviewstatus, med ny lokal
docs-/diffkontroll. Ingen commit, remote, publisering eller merge er utført.

Senere notattillegg 14.09.2026: [idediskusjon med Emil](ideer-til-diskusjon.md),
to navigasjonslenker og validatorens filliste er oppdatert etter brukerens bestilling.
Tidligere tall og uavhengig review ovenfor gjelder grunnlaget før dette tillegget.
Notattilleggets lokale kontroll besto: 21 Git-filer, 21 tekstfiler og 63 lokale lenker,
samt arbeidsdiff og staged diff uten whitespace-feil. Ingen ny kritiker er brukt.

## Første app-PR må etablere neste verifikasjonsnivå

Erstatt README-TBD med prøvde kommandoer, kjør full unit/typecheck/lint og relevante
integrasjonstester. Test UI med Playwright lokalt. Sett opp reell app-CI på PR/push når
remote er godkjent, og test branch-bygget lokalt før mergeanbefaling. Dokumentgrunnlagets
grønne kontroll kan aldri erstatte disse gatene.

## Planleggingsdokumenter 16.09.2026

Codex har skrevet [GitHub-oppsett](github-repo-oppsett.md) og [før-bygg-liste](for-bygg-start.md)
etter brukerbestilling, samt lagt navigasjon og PR-utkast til eksisterende dokumentasjon.
Dette er KI-bidrag, ikke gjennomført studentarbeid. Ingen innstillinger eller app er laget.

Lærerens 2025-transkript om dokumentasjon og relevante 2026-tekststeder er kontrollert.
Offisielle GitHub-, Shields.io- og Playwright-kilder er undersøkt for tekniske råd.
Ingen ny Canvas-kontroll, konto-/abonnementskontroll eller deploy er utført.

Uavhengig agent kontrollerte innhold, kildeklassifisering, oppgavedekning og avgrensning.
Ett funn: workflow-sikkerhet og hemmelighetskontroll var planlagt for sent. F15/F17/F20
er rettet slik at kontroll skjer ved første publisering/CI, ikke etter ferdig hovedflyt.
Øvrig review hadde ingen vesentlige funn. Hovedagenten kontrollerte rettingen.
Dokumentvalidator besto med 23 filer og 80 lokale lenker; arbeidsdiff og staged diff
besto uten whitespace-feil. Dette verifiserer dokumentene, ikke fremtidig CI eller app.

Ingen faktisk GitHub-PR kan åpnes her uten en remote og basehistorikk. De tidligere
staged filene er bevart på ny arbeidsbranch `codex/repo-setup-plan`; intet er committet,
publisert eller merget. PR-utkastet står i [review](review.md).

## Dokumentstruktur og produktavklaringer 19.09.2026

Etter Max' bestilling er produktutkastet omdøpt til kravspesifikasjon, med en separat
teknisk plan og README som inngang. Alle tre handelstyper inngår i første versjon;
forespørsler, motforslag og partenes svar er beskrevet. Chat er utsatt til etter MVP.
Åpne regler, Feide-tilgang og Emils tilslutning er ikke fylt inn som bekreftede valg.
Codex har skrevet og kontrollert endringen; den er ikke studentenes egen rapporttekst.

Uavhengig review fant ingen blokkere. Små restformuleringer om leie alene og plassering
av chat er rettet. En tidlig validatorkjøring under review så den ennå ikke stagede
omdøpingen; etter staging besto kontrollen med 26 filer og 113 lokale lenker.
Diffkontroll besto. Ingen app, tester eller GitHub-workflows er implementert her.

## Presisering av avtaler og retur 19.09.2026

Max avklarte at eieren alene bekrefter mottatt retur og fullfører gratis lån og betalt
leie. Codex har innarbeidet dette som FK-07 og AK-26–AK-29, presisert aktører og
tilstander og skilt aksept fra avslag uten å endre eksisterende krav-ID-er.
Feltliste og reserveringsregler er tydelig merket som forslag. Salgsfullføring,
Feide-tilgang og øvrige åpne produktvalg er fortsatt uavklart. Teknisk plan og
prosjektkort er samordnet; README beskriver bruk av main etter merge.

En uavhengig kritiker gjennomgikk de fem endrede produkt-/oversiktsdokumentene
uten å endre filer eller Git. Ingen handlingskrevende funn eller mergeblokkere.
Dokumentvalidator besto med 26 Git-filer, 26 tekstfiler og 113 lokale lenker;
arbeidsdiff besto uten whitespace-feil. Dette er dokumentkontroll, ikke app- eller
E2E-testing. Ingen ny Canvas-kontroll eller bekreftelse fra Emil er utført.
Brukeren har uttrykkelig godkjent PR og merge for denne web-dokumentasjonen.
