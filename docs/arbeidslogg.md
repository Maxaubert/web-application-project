# Arbeid, KI-bidrag og læringsbevis

Dette er en lett **teamhjelp**, ikke et ekstra Canvas-krav om dagbok eller timelister.
Git-historikken viser faktiske kodebidrag; korte notater hjelper dere å skrive en ærlig
rapport og følge opp læringshull. [P02/P04/P05](emnekrav.md) styrer.

## Hvor fører vi arbeidet?

- [Felles arbeidslogg for Max og Emil](../arbeidslogg-max-og-emil.md): konkrete økter,
  etterførte milepæler, beslutninger, faktiske bidrag og neste handling.
- [Timeliste](../timeliste.md): én rad per person og økt; ukjent tid føres ikke som null.
- [TODO](../TODO.md): løpende oppgaver frem til Issues og Kanban overtar.
- [Verifikasjon](verifikasjon.md): tekniske kontrollresultater og begrensninger.

Denne filen er veiledning og mal, ikke en parallell fremdriftslogg. Den første
registreringen fra 14.09 er bevart i den felles loggen med lenke til verifikasjonen.

## Lokal WAL → gjennomgang → felles arbeidslogg

`WAL.md` i repo-roten er et lokalt kladdeark for korte hendelsesnotater. Filen er
Git-ignorert og skal ikke committes. Reglene her følger derimot repoet til begge studentene.

1. Ved øktstart: les eksisterende WAL for uavklarte punkter. Hvis den mangler på denne
   maskinen, opprett den med dato, korte notater og statuser. En manglende lokal WAL er normalt.
2. Underveis: noter bestilling eller valgt handling, hvem som faktisk bidro, observert
   resultat, kilde/kontroll og neste steg. Planlagt arbeid merkes som planlagt til det er utført.
3. Ved et meningsfullt resultat, øktslutt eller bytte av maskin: gjennomgå notatene.
   Skill verifiserte fakta, brukeroppgitte beslutninger og uavklarte antakelser. Rett feil
   med et nytt korrigerende notat; ikke gjør et forsøk om til en suksess i oppsummeringen.
4. Legg en kort, gjennomgått oppsummering i felles arbeidslogg med neste L-ID og bevis.
   Oppdater TODO og berørt krav/plan. Timer føres bare fra studentenes egne opplysninger.
   Egen refleksjon og rapportbegrunnelse skrives fortsatt av studentene selv.
5. Merk kildenotatet «overført» med L-ID og eventuelt commit. Ikke lag en ny loggrad for
   samme hendelse ved neste økt. Uavklarte punkter blir stående åpne; merk eventuelt
   forkastede notater med kort grunn. Overført betyr ikke merget eller godkjent av Emil.

WAL-notater skal være korte fakta om arbeidet, ikke rå samtaler eller interne tankerekker.
Ikke lagre tokens, passord eller personfølsomt materiale selv om filen er ignorert.
Git-ignorering er ikke kryptering eller backup, og filen følger ikke med via GitHub.
Før bytte til skole-PC: overfør nødvendige, gjennomgåtte fakta og åpne oppgaver til
sporede dokumenter gjennom vanlig branch/PR. Hver maskin kan ha sin egen lokale WAL.
Rutinen utføres mens vi arbeider; ingen bakgrunnsjobb eller automatisk synkronisering er satt opp.

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

Timer er frivillig og må være faktiske, ikke estimater presentert som utført arbeid.
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
