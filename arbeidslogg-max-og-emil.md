# Arbeidslogg

Hovedpunkter per arbeidsdag. Timer står i [timelisten](timeliste.md), neste arbeid i [TODO](TODO.md).
Emils arbeid står under eget navn. KI-verktøy er nevnt der de ble brukt.

## 14.09.2026 – Kursgrunnlag

- Samlet emnekrav, kursplan og undervisningsmateriale i et dokumentasjonsgrunnlag med kildeliste og veiledning for kodeassistenter (Codex). Kontrollene står i [verifikasjonen](docs/verifikasjon.md).

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
- Skrev [skjermspesifikasjon](docs/wireframes/README.md) med ruter, datamodell, API og komponentnavn på engelsk (Claude Code).
- Laget [sign-off-rapport](docs/sign-off/rapport.pdf) med hovedflyten, én mobil- og én desktopskjerm per steg.
- Oppdaterte [kravspesifikasjonen](kravspesifikasjon.md) med beslutningene fra 28. og 29.09.
- Merget wireframes og rapport inn i develop ([PR #11](https://github.com/Maxaubert/web-application-project/pull/11)).
- Innførte daglig WAL og førte timelisten bakover fra commit-historikken.
- Emil: oppdaterte innloggingssiden og rettet komponentene.
