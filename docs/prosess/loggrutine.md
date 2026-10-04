# Arbeid, KI-bidrag og læringsbevis

Dette er en lett **teamhjelp**, ikke et ekstra Canvas-krav om dagbok eller timelister.
Git-historikken viser faktiske kodebidrag; korte notater hjelper dere å skrive en ærlig
rapport og følge opp læringshull. [P02/P04/P05](../emne/emnekrav.md) styrer.

## Hvor fører vi arbeidet?

- [Felles arbeidslogg for Max og Emil](arbeidslogg-max-og-emil.md): hovedpunkter per
  arbeidsdag i jeg-form.
- [Timeliste](timeliste.md): én rad per person og økt; ukjent tid føres ikke som null.
- [Kanban-board](https://github.com/users/Maxaubert/projects/1): oppgavene som GitHub Issues.
- [Verifikasjon](../app/dokumentkontroll.md): tekniske kontrollresultater og begrensninger.

Denne filen er veiledning og mal, ikke en parallell fremdriftslogg. Den første
registreringen fra 14.09 er bevart i den felles loggen med lenke til verifikasjonen.

## Lokal WAL → arbeidslogg og timeliste

Samme opplegg som i Max' OS-prosjekt (avklart 29.09.2026). Hver arbeidsdag har en egen fil
`wal/wal-<ÅÅÅÅ-MM-DD>.md` i repo-roten. Mappen er Git-ignorert og skal ikke committes.
Den gamle enkeltfilen `WAL.md` (19.09) er flyttet inn i `wal/wal-2026-09-19.md`.

```markdown
# WAL 29.09.2026

Løpende arbeidslogg med tidsstempler. Skrives underveis, ikke i etterkant.

| Tid | Hva |
|---|---|
| 18:45 | Kort beskrivelse av hva som faktisk skjedde, med PR/commit der det finnes. |
```

1. Ved øktstart: opprett dagens fil hvis den mangler, og les forrige fil for åpne punkter.
2. Underveis: skriv en rad når noe skjer. Klokkeslett hentes med `date "+%H:%M"`, aldri gjettet.
   Etterførte rader merkes med `~` foran klokkeslettet. Blindveier og forkastede spor skal stå.
3. Ved dagens slutt: destiller WAL til [arbeidsloggen](arbeidslogg-max-og-emil.md) som én
   oppføring per dag (`## dd.mm.åååå – Tittel (x t)`), og til [timelisten](timeliste.md) med
   én rad per person og dag: dato, kort punkt om hva som ble gjort, timer og grunnlag.
   Arbeidsloggen skrives som Max' OS-praksislogg: jeg-form med verb først («Satte opp», «Skrev»),
   korte konkrete punkter, bare utført arbeid, ingen blindveier eller sidespor. Aldri «Max gjorde».
   Emils arbeid føres som egne punkter «Emil: ...». KI-verktøy nevnes kort i parentes.
4. Timer kan foreslås som anslag fra WAL og commits. De merkes «anslag» og gjelder først når
   Max har godkjent dem. Ukjent tid føres ikke som null.

WAL-notater skal være korte fakta om arbeidet, ikke rå samtaler eller interne tankerekker.
Ikke lagre tokens, passord eller personfølsomt materiale selv om mappen er ignorert.
Git-ignorering er ikke kryptering eller backup, og filene følger ikke med via GitHub.
Hver maskin har sin egen lokale WAL; det som skal deles, går via arbeidsloggen og timelisten.

## Mal ved en meningsfull arbeidsøkt

Kopier ved behov, og fyll bare det som faktisk har skjedd. Ikke lag oppdiktede eksempelrader.

| Felt | Fylles av den som faktisk gjorde arbeidet |
|---|---|
| Dato og faktisk deltaker/forfatter | |
| Oppgave, krav-ID, commit/PR eller konkret artefakt | |
| Hva jeg faktisk gjorde, og hva medstudent/KI gjorde | |
| KI-verktøy og rolle, vesentlige forslag tatt/forkastet | |
| Verifikasjon: kommando/observasjon, resultat og begrensning | |
| Egen forklaring eller praktisk endring uten KI | Skrives av studenten, aldri autogenerert mestringspåstand |
| Hull/feil jeg fant og hva jeg vil øve på | |
| Avhengighet/tilbakemelding og neste handling | |

Timer er faktiske eller tydelig merkede anslag som Max har godkjent, aldri estimater presentert som målt tid.
Bevar skillet mellom studentens egne ord og tekniske fakta fra KI. Beskyttet refleksjon
og arkitekturbegrunnelse skrives selv. Ikke lim inn fulle prompts med persondata eller
hemmeligheter. Lenk direkte til kode/test når det erstatter lang tekst.

## Læringsstatus, startpunkt

| Person | Tema | Status | Bevis | Neste øving |
|---|---|---|---|---|
| Max | Hele appflyten | Ikke prøvd i dette repoet | Ingen | Velg første øving fra læringskartet |
| Emil | Hele appflyten | Ikke prøvd i dette repoet | Ingen | Velg første øving fra læringskartet |

Flere fagspesifikke hull føres først når studenten eller en reell øving avdekker dem.
Ikke utled evne, ambisjon eller innsats fra hvem som trykket «generer».
