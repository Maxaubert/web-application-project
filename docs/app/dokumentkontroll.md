# Dokumentkontroll

Dette dokumentet skiller faktisk gjennomført kontroll fra fremtidige appgater.
Det er **ikke en sikkerhetsrevisjon**, karaktervurdering eller attest på studentenes arbeid.

## Kjør lokalt

Fra repo-roten, med Node.js (versjon i `.node-version`) og Git:

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
Canvas eller School. Oppdatering av krav krever [kilderutinen](../emne/kilder.md).
Live innlasting i en ny assistentsesjon og visuell Markdown-rendering er separate kontroller.

Den historiske kontrolljournalen fra 14.–19.09.2026 ligger i
[arkivet](../arkiv/verifikasjon-journal-2026-09.md). App-gatene (typecheck, lint, Vitest,
Playwright) står i [CI og deploy](ci-og-deploy.md) og [appoppsettet](oppsett.md).
