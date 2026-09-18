# GitHub-oppsett: plan og sjekkliste

Planlagt 16.09.2026 for Max og Emil. **Dette er en oppgaveliste, ikke utført oppsett.**
Ingen remote, regler, issues, board, workflows, tester, deploy eller grafiske filer er
opprettet gjennom denne planen. Eksisterende grunnlagsfiler og PR-mal er utkast.
Begynn med [før-bygg-listen](for-bygg-start.md). Prosjektretningen er studentutleie,
basert på Borrow Circle; hjelp/opplæring, chat og oppgjør må avgrenses sammen.

## Hva som teller

**K = emnekrav**, fra [emnekrav](emnekrav.md), kontrollert mot Canvas 14.09.
**U = undervisningsråd/øving**, ikke automatisk innleveringskrav.
**T = foreslått teamstandard**, må avtales. **V = valgfri presentasjonspolering**.
Ingen ny Canvas-kontroll er utført 16.09. Kilder og skillet mellom 2025 og 2026 står
nederst. Dette er ingen garanti om hva faglærer blir imponert av eller hvilken karakter dere får.

Et sterkt repo gjør det lett å etterprøve problem, valg, kode, tester og reelle bidrag.
Prioriter dette før dekorasjon. Logo, trailer, Kanban og GitHub Actions er ikke oppført
som egne formelle minstekrav i den kontrollerte kravoversikten.

**Slik brukes listen:** Gi hver valgt oppgave eier, prioritet, status og lenke til bevis
i det fremtidige boardet. Kryss av først etter kontroll. Skriv «utsatt» eller «ikke valgt»
med begrunnelse i stedet for å krysse av arbeid som ikke er gjort. Oppgave-ID-ene under
er stabile; ikke opprett en parallell detaljbacklog når GitHub Issues tas i bruk.

## A. Repository og arbeidsflyt, før første funksjons-PR

- [ ] **G01 · T/K P01:** Avklar eierkonto, repo-navn, Max/Emils tilganger og privat/offentlig
  oppstart. Publisering krever egen fullmakt; offentlig repo ved innlevering er P01.
  Kontroller GitHub-planens støtte for regler og miljøer. Ikke betal eller gjør repoet offentlig
  bare for å få en funksjon uten at dette er avtalt.
- [ ] **G02 · T:** Avtal første basebranch og hvordan dagens ucommittede grunnlag skal inn
  gjennom en gjennomgått PR. Bevar eksisterende arbeid. Ikke lag fiktiv studenthistorikk.
- [ ] **G03 · T:** Beskytt hovedbranch: PR påkrevd, én godkjenning fra den andre studenten,
  foreldet godkjenning fjernes ved nye kodeendringer, samt løste reviewtråder og påkrevde
  CI-sjekker. Unngå normal admin-omgåelse, force-push og sletting. Kontroller faktisk
  håndheving med en test-PR. Hvis abonnementet mangler støtte, dokumenter at manuell
  praksis ikke er teknisk håndheving. Se [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
- [ ] **G04 · T:** Avtal små branches og PR-er, hvem som reviewer og forventet svartid.
  Én student godkjenner den andres arbeid; KI-review erstatter ikke studenten. Ved
  assistentstyrt merge gjelder i tillegg eksisterende krav om Oves konkrete PR-godkjenning.
  Ikke krev to andre godkjennere i en gruppe med to studenter.
- [ ] **G05 · T:** Tilpass eksisterende PR-mal: problem, krav-/issue-ID, endring, testbevis,
  KI-bidrag, dokumentasjonsendring og eventuelle migrasjoner. Bilder ved nytt UI er støtte,
  ikke erstatning for testing. Review skal kontrollere funksjon, tilgang og forståelighet.
- [ ] **G06 · K P02/T:** Avtal commit- og mergepraksis som bevarer ekte bidrag. Følg
  [samarbeid](samarbeid.md) for arkivering før eventuell squash og branchsletting.
  Verifiser at den leverte .git-historikken inneholder bidragene; ikke bruk commit-antall som mål.

## B. Issues, Kanban og prioritering

- [ ] **G07 · T:** Lag en enkel funksjonsmal og feilrapportmal. Innhold: brukerproblem,
  omfang/avgrensning, akseptansekriterier, prioritet, avhengigheter, eier og forventet testbevis.
  Feilrapporter trenger reproduksjon, forventet/faktisk resultat og miljø uten hemmeligheter.
- [ ] **G08 · T:** Opprett ett GitHub Project med Backlog → Ready → In progress → Review → Done.
  Bruk egne felt for prioritet, eier, størrelse og milepæl, samt blokkert/avhengighet.
  Start med høyst én aktiv implementeringsoppgave per person; hjelp hverandre ferdig.
  [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
  kan knytte boardet direkte til issues og PR-er.
- [ ] **G09 · T:** Definer Ready som avklart behov, omfang, kriterier og håndterte blokkere.
  Done betyr godkjent og merget PR, beståtte relevante sjekker og oppdatert dokumentasjon.
  Deploy-status føres separat. Ikke sett Done bare fordi kode er skrevet.
- [ ] **G10 · T:** Opprett milepæler for grunnlag, første komplette brukerflyt, sign off,
  stabilisering og levering. Kontroller gjeldende kursdatoer før kalenderfesting. Prioriter
  krav og kritiske risikoer før tilleggsfunksjoner; bruk metoden i [før-bygg-listen](for-bygg-start.md).

## C. CI og meningsfulle tester, ved første appoppsett

CI betyr continuous integration: automatisk verifikasjon av endringer. Sjekkene nedenfor
er foreslått teamoppsett; T07 er det konkrete emnekravet. Kommandoer må velges og prøves
etter stackvalget. Dokumentvalidatoren er ikke bevis på en fungerende app.

- [ ] **G11 · T:** Etabler samme Node-/pakkebehandlerversjon lokalt og i CI, låsefil og
  reproduserbar installasjon. Dokumenter hver kommando og hva feil betyr.
- [ ] **G12 · T:** Planlegg PR- og hovedbranch-kjøring med typekontroll, lint, enhetstester,
  integrasjon/dekning og produksjonsbygg. Legg til Playwright når UI finnes. Sett stabile
  navn på påkrevde sjekker, tidsgrenser og fornuftig kansellering av eldre PR-kjøringer.
  Prøv en bevisst feil senere, og bekreft at merge faktisk blokkeres. Kritiske sjekker
  skal ikke kunne passere fordi teststeget er hoppet over eller feil ignoreres.
- [ ] **G13 · K T07:** Minst én Vitest-integrasjonstest av hovedflyten og minst 50 % dekning.
  Vis rapporten, avklar målekategorier og begrunn eventuelle unntak. Test reell lagring
  og relevante feil, ikke bare mocks som alltid lykkes. Flere tester er nyttige når de
  avdekker risiko, ikke for å pynte et tall. Se også U26 s. 201 om egen testøving uten KI.
- [ ] **G14 · T:** Playwright E2E av valgt hovedflyt med to testbrukere: eksempelvis innlogging,
  publisering, forespørsel, godkjenning og at riktig bruker ser riktig status. Den konkrete
  flyten må først vedtas. Test også avvisning av uautorisert handling og ugyldig input.
- [ ] **G15 · T:** Gjør testene uavhengige med isolert database/testdata, kontrollert klokke ved
  behov og rydding. Bruk brukerrettede lokatorer og forventninger som venter på tilstand;
  unngå vilkårlig venting. Lagre feilmeldinger og traces uten private data. Undersøk ustabile
  tester i stedet for å la mange retries skjule feil.
  [Playwrights råd](https://playwright.dev/docs/best-practices) begrunner isolasjon og testing av synlig atferd.
- [ ] **G16 · T:** Gjør en manuell kontroll av tastatur, høy zoom, kontrast, mobilbredde,
  tomtilstand, venting og forståelige feilmeldinger. Automatiske tilgjengelighetssjekker
  er støtte. Kontroller hele hovedflyten på begge studentenes maskiner.

## D. CD og drift, når en fungerende flyt finnes

CD kan bety continuous delivery (klar for godkjent utrulling) eller continuous deployment
(automatisk utrulling). Avtal hvilken variant dere faktisk vil ha. Deploy er anbefalt i
emnet, ikke obligatorisk. Kursets RedwoodSDK/Cloudflare-valg gjør ikke Vercel til en default.

- [ ] **G17 · T:** Velg plattform etter stack og budsjett. Planlegg isolert PR-preview der det
  støttes, med egne testdata og ingen produksjonshemmeligheter til ukjent PR-kode.
  Lokal CI-E2E skal kunne kjøre selv om preview-tjenesten er utilgjengelig.
- [ ] **G18 · T:** Avtal produksjonsutløser etter godkjent merge og grønne sjekker, nødvendige
  hemmeligheter og rettigheter, én utrulling av gangen og enkel helsesjekk etterpå.
  Bekreft GitHub-planens støtte før dere lover miljøgodkjenning.
  [GitHub miljøer](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
- [ ] **G19 · T:** Beskriv migrasjon, backup/gjenoppretting og rollback. En rollback av appkode
  reverserer ikke nødvendigvis databasen. Test gjenoppretting på testdata før reelle data brukes.
- [ ] **G20 · T:** Planlegg nyttige logger: request-ID, feiltype og tidspunkt uten passord,
  tokens eller meldingsinnhold. Bestem hvor dere finner feil og hvem som følger dem opp.

## E. Sikkerhet, dokumentasjon og presentasjon

- [ ] **G21 · T:** Planlegg minimale workflow-rettigheter, betrodde Actions låst til commit-SHA,
  gjennomgåtte avhengighetsoppdateringer og ingen ukjent PR-kode med deploy-hemmeligheter.
  Unngå privilegert kjøring via pull_request_target uten en særskilt begrunnelse.
  [GitHub sikker bruk](https://docs.github.com/en/actions/reference/security/secure-use).
- [ ] **G22 · T:** Vurder Dependabot, hemmelighetsskanning og en enkel privat rapporteringsvei
  for sårbarheter, ut fra tilgjengelige funksjoner. Sjekk repo og historikk før publisering.
  Eksempelfiler inneholder bare variabelnavn/placeholders, aldri ekte nøkler eller studentdata.
- [ ] **G23 · K T08/T:** README: problem/målgruppe, status og begrensninger, hovedflyt,
  skjermbilder når appen finnes, kort arkitektur, eksakt install/start/DB/test/dekning-oppskrift,
  miljøvariabler uten verdier, dokumentlenker og ekte bidragsoversikt. En annen person skal
  kunne følge oppskriften fra en ren utsjekking. Publisert demo lenkes først når den virker.
- [ ] **G24 · T/U:** Hold én kilde per tema: levende krav, API-kontrakt, enkel datamodell og
  requestflyt, korte beslutningsnotater, arbeids-/KI-logg og testbevis. Knytt krav-ID → issue →
  PR → test/commit. Bruk eksisterende fagfiler fremfor å kopiere samme regel flere steder.
  Ikke skriv studentenes beskyttede rapportbegrunnelser med KI, se P05.
- [ ] **G25 · K P03/P04/T:** Studentene ferdigstiller gruppe- og KI-avtale. Planlegg jevnlig
  kort gjennomgang der begge forklarer hele flyten og prøver en liten endring uten KI.
  Loggfør faktisk øving, ikke antatt mestring eller oppdiktede møter.
- [ ] **G26 · V:** Velg navn, lag logo og et nøkternt README-toppbilde når retningen er stabil.
  Sørg for lesbarhet, alternativ tekst og avklarte rettigheter. Ikke legg privat kursmateriale
  eller andre studenters innhold inn i offentlige grafiske filer.
- [ ] **G27 · V:** Legg til få nyttige badges fra Shields.io eller GitHub: faktisk CI-status,
  faktisk dekning hvis rapporteringen finnes, og valgt lisens. Lenker skal åpne bevis/kilde.
  Ingen hardkodet «passing», oppdiktet dekningsprosent eller «godkjent av faglærer».
  [Shields.io workflow-badge](https://shields.io/badges/git-hub-actions-workflow-status) og
  [GitHubs statusbadge](https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge).
- [ ] **G28 · V:** Planlegg en kort trailer av fungerende app: problemet, hovedflyten og
  brukerresultatet. Bruk demonstrasjonsdata, teksting og lesbar tekst. En trailer erstatter
  ikke live-demo eller studentenes faglige prosjektpresentasjon. Ikke produser den nå.
- [ ] **G29 · T:** Avklar lisens med begge før publisering. Dokumenter tredjepartsbiblioteker,
  medier og attribusjon. Merk senere leveringsversjon/tag og lag GitHub-utgivelsesnotater
  som viser hva som faktisk er levert og kjente begrensninger.

## Kildegrunnlag og avgrensning

Formelle krav er sporbare gjennom [emnekrav](emnekrav.md) og [kildeindeks](kilder.md):
K01 §8 for T07/T08/P01/P02, K02 for KI-avtale og A29/A04 for samarbeid. Disse er
lokale, tidligere kontrollerte kilder, ikke en ny bekreftelse på dagens Canvas-status.
Tekniske nettlenker over ble undersøkt 16.09.2026 og må kontrolleres igjen ved oppsett.

U26 er `School/ITF31619-Webapplikasjoner/kursmateriell/tekst/webapp-2026-journey.txt`:
s. 152–158 om spesifikasjon før implementering; s. 201 om tilgangstester og egen første
testversjon; s. 229–232 om leveranse, forklaring og valgfrie utvidelser. Dette er
undervisning, og spesifikke øvingsinstrukser skal ikke gjøres til nye universelle emnekrav.

U26 s. 54–55, linjer 1908–1940: små commits og forstå diffen før den deles med andre.
U26 s. 156–157, linjer 5491–5522: lettvekts spesifikasjon, unngå repeterende dokumenter
og unødvendig prosess. U26 s. 191–192, linjer 6765–6802: ulike testnivåer, noen få
Playwright E2E-tester og isolert testdatabase. Råmateriale kopieres ikke hit.

Historisk læreropptak, 2025: `notion-2025-arkiv/leksjon-17/transkript/video1765222815.txt`
under Schools kursmateriell, linjer 493–508 og 523–527. Læreren anbefaler å forklare
vesentlige arkitektur-/authvalg og alternativer, bruke Git-historikken til å vise prosessen,
og unngå å dokumentere hver liten handling. Dette støtter korte beslutningsnotater og
sporbarhet, ikke flest mulig dokumenter. Det er pedagogisk støtte, ikke årets formelle krav.
