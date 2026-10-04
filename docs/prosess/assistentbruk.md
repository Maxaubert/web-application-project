# Bruk med Claude, Codex og ChatGPT

Felles veiledning er [AGENTS.md](../AGENTS.md). Det er prosjektkontekst og arbeidsregler,
ikke teknisk håndheving, en ferdig besvarelse eller bevis på at en assistent følger alt.

## Hva lastes faktisk?

| Verktøy | Oppsett og kontroll |
|---|---|
| Codex med repo-tilgang | Prosjektets AGENTS.md inngår normalt fra repo-roten til arbeidsmappen. Globale instrukser og eventuelle overrides påvirker. Start ny oppgave fra dette repoet og be om hvilke instrukser som er aktive |
| Claude Code | CLAUDE.md importerer `@AGENTS.md`. Relativ import er fra importfilen. Kontroller lastede instruksjonsfiler med `/context`; bruk `/memory` for å finne og åpne kildefilene |
| Vanlig ChatGPT/Claude-chat | Ikke anta at en lokal fil leses automatisk. Gi AGENTS.md og relevant fagfil som godkjent tekst/vedlegg eller gjennom uttrykkelig repo-tilgang. Oppgi hvilken versjon/dato som gjelder |

En vanlig Markdown-lenke laster ikke automatisk hele målfilen. Start med krav/prosjekt/KI,
og last teknikk eller læringskart etter oppgaven. Hold veiledningen kort og sjekk i en
ny sesjon at assistenten kan finne T04, P05, KI-øvingsgrensene og at appidé er åpen.
Ikke send rå kursarkiv, legitimasjon eller privat materiale for å «gi mer kontekst».

Kildene for innlasting er kontrollert 14.09.2026:
[OpenAI AGENTS-dokumentasjon](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
og [Claude Code memory/import](https://code.claude.com/docs/en/memory).
Dette grunnlaget endrer ingen global Codex-/Claude-konfigurasjon og installerer ingen hooks.
Live innlasting i en ny Claude/Codex-sesjon er ikke testet av dokumentvalidatoren.

## Oppgaveprompter

Velg den modusen som passer. Ikke skriv studentens svar inn på forhånd.

**Bygg en avklart funksjon:**

> Les AGENTS.md, docs/emnekrav.md, KI-AVTALE.md og relevant del av docs/teknikk.md.
> Utfør denne avklarte oppgaven: [oppgave]. Vis krav-ID-er og åpne antakelser.
> Ikke skriv beskyttet studenttekst. Implementer, test og forklar dataflyten kort.
> Tilby én liten endringsoppgave så hver av oss kan prøve forståelsen selv.

**Forklar et begrep eller eksisterende kode:**

> Kontroller lærerens 2026-kontekst først. Forklar [begrep/fil] med et konkret eksempel
> fra vår app. Skill dagens krav fra historiske råd. Følg én brukerhandling hele veien.
> Still ett kontrollspørsmål om gangen og vent på mitt svar før du vurderer det.

**Øv til muntlig:**

> Bruk docs/laering.md. Gi et nytt case om [tema], uten fasit eller ledende svar.
> Still oppfølgingsspørsmål etter svaret mitt. Vurder korrekthet, forklaring av flyt,
> alternativ og avveining. Registrer bare observert mestring, og be meg skrive min egen refleksjon.

**Uavhengig review:**

> Les endringen og relevante primærkilder. Finn konkrete bugs, kildekonflikter,
> ubegrunnede krav og læringshull. Oppgi sted, evidens og konsekvens, også når kontroll
> ikke kunne utføres. Ikke bruk en grønn docsjekk som bevis på appkvalitet eller læring.

## Når assistenten oppdager avvik

En nyttig melding har formen: «T04 krever tilgangskontroll i skrivehandler (K01 §8).
Denne handleren bruker bare rutebeskyttelsen. Et direkte actionkall kan derfor mangle
kontroll. Legg inn sesjon/eierskap og test uendret DB ved avvisning.» Dette er et
generisk eksempel, ikke et funn i en app som ennå ikke finnes.

Ved ny brukeridé: undersøk og forklar konsekvensene før omfang utvides. Ved beskyttet
egenarbeid: forklar kildegrensen og hjelp med begreper/øving. Ved ukjent kilde: merk
usikkerheten. Ved vanlig autorisert kodearbeid: utfør arbeidet uten unødige spørsmål.
