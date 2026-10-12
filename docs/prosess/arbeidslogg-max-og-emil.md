# Arbeidslogg

Hovedpunkter per arbeidsdag. Timer står i [timelisten](timeliste.md), neste arbeid på [Kanban-boardet](https://github.com/users/Maxaubert/projects/1).
Emils arbeid står under eget navn. KI-verktøy er nevnt der de ble brukt.

## 14.09.2026 – Kursgrunnlag

- Samlet emnekrav, kursplan og undervisningsmateriale i et dokumentasjonsgrunnlag med kildeliste og veiledning for kodeassistenter (Codex). Kontrollene står i [verifikasjonen](../app/dokumentkontroll.md).

## 18.09.2026 – Repo, oppsettplan og første kravutkast (2,5 t)

- Opprettet et privat GitHub-repo for prosjektet og la inn prosjektgrunnlaget.
- Skrev plan for GitHub-oppsett og hva som må være på plass før vi begynner å bygge.
- Samlet planleggingen i en to-do-liste med ti temaer.
- Laget første utkast til krav for studentmarkedet sammen med Codex.

## 19.09.2026 – Kravspesifikasjon, KI-avtale og CI (4 t)

- Presiserte appen: studentmarked med salg, lån og leie, forespørsler med motforslag og oppgjør utenfor appen. Skilte kravspesifikasjonen fra den tekniske planen og la til testbare akseptkriterier ([PR #1](https://github.com/Maxaubert/web-application-project/pull/1)).
- Undersøkte Feide som innlogging. Det krever at institusjonen aktiverer tjenesten, så jeg valgte det bort.
- Inviterte Emil til repoet.
- Hentet lærerens KI-avtale fra Canvas etter tips fra Emil, og la den i en egen kildefil ([PR #2](https://github.com/Maxaubert/web-application-project/pull/2)).
- Satte opp CI for dokumentene. Branch protection lot seg ikke slå på for et privat repo på gratisabonnementet.
- Opprettet timeliste, felles arbeidslogg og lokal WAL.

## 20.09.2026 – Appoppsett (2 t)

- Satte opp den offisielle RedwoodSDK-starteren i `app/` med TypeScript, lokal D1 med Drizzle, lint, Vitest og Playwright (Codex). Startertestene, bygget og lokal SQL besto.
- Oppdaterte CI, README og to-do-listen.

## 21.09.2026 – Merging (0,5 t)

- Merget oppsett-PR #3 og Dependabot-PR #4 til #6.
- Emil: startet på innloggingssiden (`login.tsx`, `email.tsx`, `password.tsx`), og la til `use client` i komponentene 23.09.

## 28.09.2026 – Sign-off-krav og kravdiskusjon (5 t)

- Hentet sign-off-kravene fra Canvas og laget en sjekkliste.
- Vurderte kritisk hvor godt prosjektet dekker kravene.
- Gikk gjennom de åpne produktspørsmålene og tok beslutningene (D-01 til D-91). De er samlet i `kravdiskusjon.md` i School-repoet.
- Laget en plan for sign-off.

## 29.09.2026 – Wireframes, kravspesifikasjon og sign-off-rapport (7 t)

- Tegnet wireframes for hele MVP-en i mobil og desktop med Claude Design, én skjerm om gangen: innlogging, søk, annonse, bud og lån, forespørsler, avtale, Min side og profil.
- Valgte innlogging med e-postkode eller lenke, bare for @hiof.no. Kategoriene ble salg, lån og gis bort, med bud ved salg og periode ved lån. Sted og tid avtales utenfor appen.
- Avklarte reglene: eier bekrefter retur, lånepris er ukepris delt på 7 per dag, ubesvarte forespørsler utløper etter 7 dager, og overlevering regnes som bekreftet etter 3 dager. Returrapporter ses bare av den som skrev dem og admin. Solgte annonser kan ikke legges ut på nytt.
- Skrev [skjermspesifikasjon](../design/wireframes/README.md) med ruter, datamodell, API og komponentnavn på engelsk (Claude Code).
- Laget [sign-off-rapport](../leveranser/sign-off/rapport.pdf) med hovedflyten, én mobil- og én desktopskjerm per steg.
- Oppdaterte [kravspesifikasjonen](../krav/kravspesifikasjon.md) med beslutningene fra 28. og 29.09.
- Merget wireframes og rapport inn i develop ([PR #11](https://github.com/Maxaubert/web-application-project/pull/11)).
- Innførte daglig WAL og førte timelisten bakover fra commit-historikken.
- Satte opp Kanban-board i GitHub Projects og fordelte sign-off-oppgavene.
- Emil: oppdaterte innloggingssiden og rettet komponentene.

## 30.09.2026 – Sign-off ferdigstilt

- Hentet Fullstækk-kursene (19 leksjoner) inn i School-repoet etter mitt ja, og lagde et oppslag Claude Code bruker for å finne riktig leksjon. Kursmateriellet ligger ikke i dette repoet.
- Fylte ut [KI-avtalen](ki-avtale.md) etter mine svar; godtatt av begge (#18).
- Skrev rapportdisposisjonen med KI-utkast til ingressen (#22) og «ikke med»-listen i kravspesifikasjonen (#14).
- Tok skjermbilder av Kanban-boardet og testkjøringen (#15, #21) og bygde sign-off-rapporten (11 Canvas-punkter med bevis, #24) og sluttrapporten som PDF.
- La `loanPrice` med enhetstest (4 tester) rett på develop etter mitt ønske; koden er skrevet av KI.
- Ryddet branchene: slettet `setup/initial-project`, lukket PR #10 (dekket av #35). Dependabot-PR-ene står.

## 05.10.2026 – Dokumentstruktur, endringslogg og grenbeskyttelse

- Fjernet kravet om godkjent review før merge til main; PR og grønn CI kreves fortsatt ([PR #38](https://github.com/Maxaubert/web-application-project/pull/38)).
- Merget develop til main ([PR #35](https://github.com/Maxaubert/web-application-project/pull/35)) og Kanban-overgangen ([PR #36](https://github.com/Maxaubert/web-application-project/pull/36)).
- Bestilte en gjennomgang av alle dokumentene og en ny mappestruktur i `docs/`, og godkjente planen. Claude Code gjennomførte flyttingen, splittet ut akseptansekriteriene og arkiverte utdaterte planfiler.
- Opprettet [endringsloggen](../endringslogg.md), som studentassistenten anbefalte på sign-off.
- Førte inn studentassistentens KI-veiledning fra sign-off i [KI-avtalen](ki-avtale.md).
- La åpne punkter som issues på Kanban-boardet (#39, #40, #41).
- Gikk gjennom alle valgene for innloggingen med Claude Code og forsvarte dem: kode i stedet for passord, ingen lenke, grenser for koder, øktlengde, telefon med land, logging og Tailwind. Feide og e-postutsending ble undersøkt (#46).
- Godkjente planen og hver test før Claude Code bygget innloggingen (#47). Prøvde flyten i nettleseren.
- Merget innloggingen ([PR #48](https://github.com/Maxaubert/web-application-project/pull/48)) etter at jeg hadde prøvd den: telefonfeltet på én rad, og koden vises i nettleserkonsollen lokalt med en ekstra lås som holder den ute av produksjon.
- Innførte Kanban-flyten (#50), gjenopprettet develop og tok inn Dependabot-PR-ene; rettet develop da CI ble rød etter en eldre fil fra Emil (#54).
- Bestilte en komponentundersøkelse (workflow) og dokumenterte komponentbeslutningene mine i [komponenter](../app/komponenter.md) (#60, #67).

## 07.10.2026 – Deploy, domene, e-post og første annonser

- Innførte PR-størrelsesregelen fra faglæreren (#68, #69).
- Deployet til Cloudflare selv: D1 `webapp-db`, migrasjoner og secrets (#70). Skaffet domenet studentmarkedet.org og satte opp Resend og DNS, og ekte innloggingskode kom i HiØ-innboksen (#72, #46). Resend-nøkkelen ble rotert to ganger etter at den havnet i chat.
- Eget domene (#73, #74) og lett grenbeskyttelse på develop (#75, #76).
- Bygde annonsetabellen med migrasjon og seed, og forsiden med annonsekort (#79, #80, #81).
- Autodeploy fra main ([deploy.yml](../../.github/workflows/deploy.yml), #82, #83). Rettet et sikkerhetsfunn i workflowen (den kunne kjøre fra en fork-PR). Første autodeploy ble grønn, og jeg kjørte seed-filen én gang mot sky-databasen (6 testannonser).
- Rettet develop da en uferdig fil fra Emil gjorde CI rød (#77, #78).

## 08.10.2026 – Nytt navn

- Endret navnet til Studentmarkedet (#88, [PR #89](https://github.com/Maxaubert/web-application-project/pull/89), release [PR #90](https://github.com/Maxaubert/web-application-project/pull/90)) og la issues for annonsesiden og de neste punktene (#91–#93).

## 09.10.2026 – Annonsesiden

- Bygde annonsesiden `/listings/:id` (#91) med tester og mutasjonssjekk. Rettet Emils `sortedList.tsx`, som gjorde develop rød, minimalt etter mitt valg (#95). Release [PR #96](https://github.com/Maxaubert/web-application-project/pull/96): annonsesiden er live bak innlogging.

## 10.10.2026 – Søk, filtre og API

- Undersøkte om en deploy logger ut brukere: økten overlevde en manuell deploy, så ingen bakdør trengs.
- Bygde søk med feiltolerant treff (#97, #103), `GET /api/listings` (#98, #105), `/dev/login` med to låser (#106) og innloggede Playwright-tester (#94, #108), og live søkeforslag (#104, #109).
- Lot en workflow gå gjennom UI-et (16 funn) og rettet dem (#113, #114).
- Filtre (#102, #117): valgte kategori og avkrysning etter mockups og valgte bort prisglideren da jeg gikk gjennom filene (#118). Straks-filtre uten knapp (#122, #123), prisfelt uten piler (#120) og justering av rutenettet (#124, #126).
- Én CI-kjøring ble rød fordi en test skrev før siden var hydrert; rettet med `networkidle` (#121).
- Releaser til main: [PR #112](https://github.com/Maxaubert/web-application-project/pull/112) og [PR #115](https://github.com/Maxaubert/web-application-project/pull/115).

## 11.10.2026 – Legg ut annonse, bilder og mobil

- «Legg ut annonse»: valgte mockup 13 blant tolv retninger (laget med en workflow), og Claude Code bygde handlingen med Zod-validering (#131, #132) og skjermen (#133, #134). Jeg testet lokalt og endret bredde, knapper og tellere flere ganger (#135, #136, #146). Ny regel: feature-PR-er merges ikke før jeg har testet branchen lokalt.
- Bilder: aktiverte R2 og lagde bucketen selv (#138). Lagring, servering, bildefelt med HEIC og nedskalering (#139, #141, #144), CSP-rettelse for forhåndsvisning, galleri og forsidebilde (#150) og 34 demoannonser med bilder (#152, #153), som jeg godkjente å kjøre live.
- Lot Claude Code måle at bildene var tunge (5136 KB, 453 ms dekoding) og bygge 640 px miniatyrer (#155, #158; 1080 KB, 25 ms). Lot e2e-testene få egen lagring så de ikke rører dev-databasen (#154, #160).
- Mobil (#147): ikonknapper og mindre titler (#162, #163) og søkefeltet på én rad uten hjelpetekst (#164, #165).
- Ni releaser til main (#130, #137, #140, #145, #149, #157, #159, #161, #166), hver etter grønn CI.

## 12.10.2026 – Mobil ferdig og Forhåndsvis

- Mobil: annonsesiden med liten tittel og miniatyrer på én rad (#167, #168) og «Legg ut annonse» uten forhåndsvisning under 640 px (#169, #170). Jeg testet hver for seg og godkjente dem. Release [PR #173](https://github.com/Maxaubert/web-application-project/pull/173). Kontooppsett og kodeside sjekket i nettleseren; #147 er lukket.
- Ny knapp «Forhåndsvis» (mobil og desktop) som viser den ekte annonsesiden med det jeg har skrevet, i en dialog med «Avbryt» og «Publiser» (#171, #172). Jeg valgte dialog og fikk lage en mockup som jeg justerte (bare «Avbryt» og «Publiser» som knapper) før den ble bygget.
- Forklarte en tilfeldig rød CI-kjøring fra sporet som CI laster opp: testen handlet før hydreringen. Mobiltestene venter nå på `networkidle` (#174, [PR #175](https://github.com/Maxaubert/web-application-project/pull/175)).
- Fører WAL til arbeidslogg og timeliste, og legger skjermbilder av Forhåndsvis i wireframe-mappen (#176).
