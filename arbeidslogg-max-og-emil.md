# Arbeidslogg for Max og Emil

Felles fremdriftslogg for prosjektet. Sist oppdatert 20.09.2026.
Se [aktive oppgaver](TODO.md), [timeliste](timeliste.md) og
[veiledning for arbeid, KI-bidrag og læringsbevis](docs/arbeidslogg.md).

Loggen beskriver hva som faktisk er gjort og valgt. Den erstatter ikke studentenes
egne refleksjoner eller rapport. Oppføringene nedenfor er etterført av Codex fra
samtalen, dokumentene og Git-historikken. Ukjente bidrag og timer er ikke fylt inn.
«Max + Codex» betyr Max' bestilling/avklaringer og Codex' dokument-/undersøkelsesarbeid,
ikke at Max har skrevet eller prøvd alt selv. Emils selvstendige arbeid føres når kjent.

## Etterførte milepæler

| ID | Dato | Kjente bidrag | Arbeid og resultat | Bevis / oppfølging |
|---|---|---|---|---|
| L01 | 14.09.2026 | Max + Codex; kilde- og kritikeragenter | Opprettet kursbasert dokumentasjonsgrunnlag og assistentveiledning. Ingen appkode eller påvist studentmestring. | [Verifikasjonslogg](docs/verifikasjon.md) |
| L02 | 16.–18.09.2026 | Max + Codex | Dokumenterte GitHub-oppsett og før-bygg-plan. Opprettet privat GitHub-repo og to-do-liste med ti planleggingstemaer. | [GitHub-plan](docs/github-repo-oppsett.md), [TODO](TODO.md); oppsettplan er ikke implementert CI/board |
| L03 | 19.09.2026 | Max + Codex | Presiserte studentmarkedet: salg, gratis lån og betalt leie i MVP. Forespørsler med motforslag, chat senere og oppgjør utenfor appen. Eier alene bekrefter retur for lån/leie. Skilte kravspekk og teknisk plan, og la til testbare kriterier. | [Kravspesifikasjon](kravspesifikasjon.md), [merget dokumentasjons-PR](https://github.com/Maxaubert/web-application-project/pull/1). Gruppegjennomgang gjenstår |
| L04 | 19.09.2026 | Codex undersøkte; Max oppga beslutningen | Undersøkte Feide via offisiell dokumentasjon. Fant mulighet for OIDC-integrasjon, men behov for institusjonsaktivering før institusjonens brukere får tilgang. Max valgte deretter Feide bort som ikke riktig løsning for prosjektet. | [Teknisk plan](docs/teknisk-plan.md). Ingen praktisk integrasjonstest eller avslag fra HiØ; detaljert beslutningsbegrunnelse er ikke oppgitt. Alternativ innlogging gjenstår |
| L05 | 19.09.2026 | Max ba om tilgang; Codex sendte invitasjonen | Inviterte Emil-18 til web-repoet med skrivetilgang. | Invitasjonen var ventende ved utsending; aksept er ikke kontrollert på nytt |
| L06 | 19.09.2026 | Emil tipset om avtalen, videreformidlet av Max; Codex hentet og kontrollerte | Fant publisert KI-avtale på Canvas og la lærerens ordlyd i egen kildefil. Skilte lærerens tekst fra gruppens ubekreftede avtale. Kilde- og dokumentkontroll besto. | [Kildetekst](docs/ki-avtale-canvas.md), [PR for KI-kilden](https://github.com/Maxaubert/web-application-project/pull/2). Max og Emil må fortsatt avklare egen KI-praksis |
| L07 | 19.09.2026 | Max + Codex | Oppdaterte to-do med faktisk fremdrift og neste oppgaver. Opprettet denne felles loggen og tom timeliste, og la inn rutine for videre oppdateringer. Uavhengig review og dokumentkontroll besto. | [TODO](TODO.md), [timeliste](timeliste.md). Ingen timer er oppgitt; Issues og Kanban tas i bruk senere |

## Nye økter

Legg til én kort oppføring per meningsfull økt, nyeste nederst. Bruk neste L-ID.
Ved endret beslutning: behold den gamle oppføringen og lenk til den nye. Oppdater
også gjeldende krav eller plan, slik at loggen ikke blir den eneste kilden til valget.

| ID | Dato | Deltaker og konkret bidrag | Oppgave / resultat / beslutning | Kontroll eller lenke | Neste handling |
|---|---|---|---|---|---|
| L08 | 19.09.2026 | Max bestilte, Codex satte opp | La til CI for dokumentene, Actions-oppdateringer og forberedt PR-beskyttelse. GitHub-CI besto. GitHub avviste branch protection for privat repo på gjeldende abonnement; ingen teknisk PR-sperre er aktiv. | [CI og deploy](docs/ci-og-deploy.md), [første beståtte CI-kjøring](https://github.com/Maxaubert/web-application-project/actions/runs/35448304403). Ingen app, deploy eller timer | Avklar abonnement, aktiver og verifiser beskyttelse; bygg reelle appkontroller med første app-PR |
| L09 | 19.09.2026 | Max bestilte, Codex satte opp | Opprettet lokal, Git-ignorert WAL for korte løpende faktanotater, med rutine for senere gjennomgang og oppsummering i denne loggen. | [Loggrutine](docs/arbeidslogg.md). Rå-WAL følger ikke med til GitHub eller skole-PC; ingen timer oppgitt | Vedlikehold WAL under økten og overfør gjennomgåtte fakta før overlevering |
| L10 | 19.09.2026 (etterført 20.09) | Max godkjente, Codex merget | PR 2 squash-merget, main synkronisert. Originalhistorikk bevart i lokal arkivtag. | [Merget PR 2](https://github.com/Maxaubert/web-application-project/pull/2), [bestått main-CI](https://github.com/Maxaubert/web-application-project/actions/runs/35451830804) | PR-beskyttelse fortsatt blokkert; ingen timer oppgitt |
| L11 | 20.09.2026 | Max bestilte, Codex kontrollerte | Hentet siste web-repo; allerede oppdatert. Emil-18 er nå samarbeidspartner. Ingen Emil-commits/PR-er funnet ved denne kontrollen; lokalt arbeid hos Emil er ukjent. | GitHub API for commits, branches, PR-er og samarbeidspartnere | Emil prøver oppsett og committer egne bidrag |
| L12 | 20.09.2026 | Max bestilte, Codex initialiserte og prøvde | Offisiell RedwoodSDK/Vite-starter i app/, npm, TypeScript, lokal D1/Drizzle, lint og testverktøy. Ingen markedsplasskode eller skyressurser. Oppdatert CI, README og TODO. | [Oppsett og kontroller](docs/app-oppsett.md), branch setup/initial-project. Tre Vitest- og to Playwright-tester besto lokalt, bygg og lokal SQL besto. Studenttimer ikke oppgitt | PR-review og Emils egen installasjon; produktmodell og hovedflyt gjenstår |

Bruk faktisk øktdato; merk eventuell etterføring. Oppgi KI-verktøy og faktisk rolle.
Skriv ikke «vi» dersom bare én har arbeidet, og ikke før ventetid på KI som automatisk
studentarbeid. Studentene skriver selv det de har lært eller fortsatt ikke forstår.
