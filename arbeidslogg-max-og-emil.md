# Arbeidslogg for Max og Emil

Felles fremdriftslogg for prosjektet. Sist oppdatert 19.09.2026.
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
| L06 | 19.09.2026 | Emil tipset om avtalen, videreformidlet av Max; Codex hentet og kontrollerte | Fant publisert KI-avtale på Canvas og la lærerens ordlyd i egen kildefil. Skilte lærerens tekst fra gruppens ubekreftede avtale. Kilde- og dokumentkontroll besto. | [Kildetekst](docs/ki-avtale-canvas.md), [åpen PR](https://github.com/Maxaubert/web-application-project/pull/2). Max og Emil må fortsatt avklare egen KI-praksis |
| L07 | 19.09.2026 | Max + Codex | Oppdaterte to-do med faktisk fremdrift og neste oppgaver. Opprettet denne felles loggen og tom timeliste, og la inn rutine for videre oppdateringer. Uavhengig review og dokumentkontroll besto. | [TODO](TODO.md), [timeliste](timeliste.md). Ingen timer er oppgitt; Issues og Kanban tas i bruk senere |

## Nye økter

Legg til én kort oppføring per meningsfull økt, nyeste nederst. Bruk neste L-ID.
Ved endret beslutning: behold den gamle oppføringen og lenk til den nye. Oppdater
også gjeldende krav eller plan, slik at loggen ikke blir den eneste kilden til valget.

| ID | Dato | Deltaker og konkret bidrag | Oppgave / resultat / beslutning | Kontroll eller lenke | Neste handling |
|---|---|---|---|---|---|
| L08 | 19.09.2026 | Max bestilte, Codex satte opp | La til CI for dokumentene, Actions-oppdateringer og forberedt PR-beskyttelse. GitHub-CI besto. GitHub avviste branch protection for privat repo på gjeldende abonnement; ingen teknisk PR-sperre er aktiv. | [CI og deploy](docs/ci-og-deploy.md), [første beståtte CI-kjøring](https://github.com/Maxaubert/web-application-project/actions/runs/35448304403). Ingen app, deploy eller timer | Avklar abonnement, aktiver og verifiser beskyttelse; bygg reelle appkontroller med første app-PR |

Bruk faktisk øktdato; merk eventuell etterføring. Oppgi KI-verktøy og faktisk rolle.
Skriv ikke «vi» dersom bare én har arbeidet, og ikke før ventetid på KI som automatisk
studentarbeid. Studentene skriver selv det de har lært eller fortsatt ikke forstår.
