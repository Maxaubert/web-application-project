# Læringskart og eksamensøving

Målet er at **begge kan forklare og endre hele appen uten KI**. Prosjektet er inngang
til muntlig, ikke karakteren i seg selv. Dette er et øvingskart, ikke fasit, lærerens
spørsmålsbank eller en garanti om hvilke spørsmål som kommer.
Kilder: [K01 §12, A14 og U26](kilder.md). Sidene viser 2026-tekstutgaven.

Kurset har to like viktige, sammenvevde spor: praktisk teknisk håndverk og kritisk
KI-bruk med etikk, jus og selvstendig begrunnelse (U26 s. 4). Ingen av dem kan
erstattes med bare en pen demo eller bare generelle refleksjoner.

## Hvordan øve uten å gjøre alt tregt

Etter en vesentlig funksjon: den som ikke skrev den, følger en handling gjennom koden.
Bytt deretter rolle. Forklar uten KI, tegn flyten og gjør en liten endring eller feilsøk.
Slå opp etter forsøket, test og prøv igjen. Fem gode minutter er bedre enn mange
automatisk utfylte avkrysninger. Vanlig produktivt KI-arbeid kan fortsette mellom øvingene.

Nivåene er **ikke prøvd → med støtte → forklart uten støtte → endret/feilsøkt uten støtte**.
Før faktisk dato, oppgave og observasjon i [arbeidsloggen](arbeidslogg.md). Mestring er
temaavhengig. Lesing, fullført video og KI-forklaring er ikke alene bevis på mestring.
Studentene skriver egne refleksjoner; ingen assistent fyller dem inn på deres vegne.

## Andre undervisningsaktiviteter som må holdes synlige

U26 s. 9, linje 307–317, beskriver bransjeforskning: ett intervju med utvikler eller
bedrift om faktisk KI-bruk, cirka 20–30 minutter, notater og 2–3 minutters oppsummering.
Tema er regler, risiko, produktivitet og opplæring; innhent samtykke og anonymiser ved
behov. Den generelle oversikten omtaler også presentasjoner, men K01 bestemmer de
gjeldende seks arbeidskravene. **Intervjuets tildeling og frist er ikke bekreftet** i
denne kontrollen, så det er undervisningsaktivitet å avklare, ikke et oppfunnet sjuende krav.
L5 s. 108 åpner for diskusjon basert på kjente eksempler dersom intervju ikke er gjort.
Studentene velger kontakt og gjennomfører selv; ingen henvendelse eller intervjufunn er laget her.

## Grunnlag og hovedløp

Alle rader gjelder både Max og Emil. Individuell status er foreløpig **ikke prøvd her**.
Øvingsforslagene under er våre nye spørsmål, ikke hentede eksamens-/adminfasiter.

| Del og kilde | Undertemaer som må kunne forklares | Prøv selv uten KI |
|---|---|---|
| Forkunnskap; K01/A04/A08, U26 L1 | JS-verdier, funksjoner/callbacks, scope/closures, arrays/objekter, destructuring, moduler; promises/async/await; TS-unions, narrowing, typer/generics; React props/state/events | Forklar hvorfor en asynkron funksjon ikke returnerer ferdig data direkte. Endre en callback uten å flytte ansvaret feil |
| L1 s. 12–30 | HTTP request/response, URL/metoder/status; SSR/CSR/RSC; server/klient-grense; framework-kostnader; Workers/isolate og lokal runtime; prosjektets sentrale filer | Tegn én forespørsel fra nettleser til respons. Hva sendes over nettverket, hva blir på serveren? |
| L2 s. 31–47 | Rød/grønn/refaktor, assertion, toBe/toEqual, kanttilfeller, unit/integrasjon, fire KI-bruksmåter i TDD, tester som gir falsk trygghet | Lag en liten feil og en test som avslører den. Forklar hva testen ikke beviser. TDD er nyttig, men ikke obligatorisk ved all utforskning |
| L2b s. 48–58 | Agentens les/planlegg/verktøy/verifiser-løkke, kontekst, AGENTS, subagenter, Git-checkpoints/diff, ansvar for output | Finn en manglende forutsetning i en KI-plan. Forklar hvordan du verifiserer agentens arbeid uten å tro på oppsummeringen |
| L3 s. 59–80 | Routing/prefix/params, middleware, ctx, interruptor, runtime-validering, server query/action, HTTP-kontrakt, Result, TS module augmentation | Flytt en middleware i en skisse og forklar konsekvensen. Hvor må tilgang kontrolleres ved direkte actionkall? |
| L4 s. 81–106 | Nevrale nett, parametre/transformere, lokal modell, tokens/kontekst, temperatur/top-p, prompts/few-shot/strukturert output, cache, modellvalg/benchmark, Workers AI, streaming/SSE, timeout/modellfeil | Begrunn modellvalg med ett alternativ og en kostnad. Hvordan håndterer UI et avbrutt stream? Ikke lær utdaterte priser som naturlover |
| L5 s. 107–127 | Komponentansvar, props/callbacks, lokal/løftet state, custom hooks, render, forms, useTransition/useActionState, layouts/navigation, Tailwind/responsivitet/mørk visning | Følg submit fra skjema til action og tilbake til visningen. Hvorfor deler to kall til samme hook ikke automatisk state? |
| L5a s. 128–137 | Testing Library, userEvent, observérbar atferd, mocks/spies, fake timers, async, integrasjon mot unit, øvingsspesifikk dekning | Skriv en testidé for brukerens feiltilstand uten å sjekke intern state. Hva må ventes på? |
| L6 s. 138–149 | KI-assistert/drevet/vibe, fire typiske sårbarheter, teknisk gjeld, kodekritikk, refaktorering og varig arkitektur | Finn en enkel løsning på overkomplisert kode. Hvilken invariant må testene bevare når du refaktorerer? |
| L6b s. 150–159 | Specify/Plan/Tasks/Implement, atferd kontra arkitektur, Given/When/Then, akseptansekriterier, når SDD lønner seg, begrensninger | Skriv et atferdskriterium for feil eier. Forklar hvorfor en femlinjers retting ikke alltid trenger en stor spec |
| L7 s. 160–170 | Treningsdata/samtykke, bias, transparens, ansvar, miljøkostnad, brukerens handlingsrom og etikk som arkitektur | Hvilket konkret valg begrenser skade i en tenkt KI-funksjon? Hva ville et annet valg kostet? |
| L8 s. 171–189 | D1/SQLite mot Durable Objects, eget skjema, nøkler/relasjoner/constraints, migrasjoner, typer/validering, CRUD/JOIN, indekskostnad, eierskap, parametrisert SQL | Tegn skjemaet uten editor. Legg til et felt og forklar migrasjon, validering, UI og tester som må følge med |
| L8a s. 190–202 | Testpyramide; ekte in-memory SQLite/migrasjoner, Drizzle, fixture/universe, runAs/aktører, mocks av runtime/AI, lagringstilstand, tilgang og injeksjon | Forklar forskjellen på 401 og feil eier. Hvordan beviser testen at avvist skriving ikke endrer DB? To egne første tester i denne øvingen |
| L9 s. 203–216 | Opphavsrett, tillatende/copyleft-lisenser, KI-kode, GDPR/formål/minimering/automatisering, AI Act/risiko, ansvar; reell better-auth med sessionMiddleware | Drøft en tenkt funksjon ut fra data, risiko og tiltak. Skilj pensumets daterte tidslinje fra gjeldende rett |
| L10 s. 217–234 | Hel flyt og feilhåndtering, auth/middleware, frontend/backend/DB, hemmeligheter, migrering/staging/deploy, integrasjon, produktledelse og refleksjon | Diagnostiser «lagringen virker, men UI viser gammel verdi». Forklar hvilken grense og test du undersøker først |

## Fordypning: prinsippene er pensum, funksjonene velges etter behov

U26 s. 232 sier uttrykkelig at L11–15-prinsippene er eksamensrelevante, uten krav om
å implementere alt. Ekte login og tilgangskontroll er allerede T04/T05. Ikke bruk
«valgfrie utvidelser» som begrunnelse for å fjerne sikkerheten fra hovedflyten.

| Del og kilde | Undertemaer | Forklar uten å bygge alt |
|---|---|---|
| L11 RAG s. 235–252, særlig 248 | Embeddings, semantisk likhet, vektorindeks/metadata, indeksering, retrieve/augment/generate, D1-oppslag, backfill, kilder/grounding | Hvordan skiller oppdatering av indeks seg fra en vanlig forespørsel? Hvor kan svaret fortsatt være feil eller påvirkes av ubetrodd tekst? |
| L12 auth s. 253–274, særlig 270–271 | Stateless HTTP, cookies HttpOnly/Secure/SameSite, session/JWT, authn/authz, salt/work factor/minneharde hash, bibliotekansvar, verifisering/OTP/PIN/2FA, brute force/credential stuffing, rate limit/lockout, least privilege/default deny, bygge/kjøpe | Hva skjer etter innlogging og ved utlogging? Hva må nettleseren faktisk motta? Hvorfor er passordhash forskjellig fra kryptering? |
| L13 sikkerhet s. 275–296, særlig 292–293 | SQLi/parametre, XSS/escaping, CSP/nonce, CSRF/Origin/SameSite, inputvalidering, eierskap i handler, action origin, trusselmodell | Velg én angrepssti og forklar både kontroll og test. Hva beskytter ikke en skjult knapp eller TypeScript-type mot? |
| L14 filer s. 297–313, særlig 309 | Object storage mot DB-blob, multipart/streaming, type/størrelse, metadata og tilgang, cache-control/ETag, preview/object URL, foreldreløse filer, unik nøkkel/cacheinvalidering | Hvordan håndteres at filopplasting lykkes, men DB-skriving feiler? Hvordan hindres at en annen bruker leser en privat fil? |
| L15 cron s. 314–333, særlig 331 | Cronuttrykk/UTC, scheduled kontra fetch, dispatch/waitUntil, opprydding/digest/reindeksering, idempotens/retries, batcher, lokal trigger og logger | Hva skjer hvis jobben kjører to ganger eller avbrytes halvveis? Hvilken tilstand og logg lar deg reparere trygt? |

## Øvingsrunde for to

1. Trekk et tema som er undervist eller avtalt for selvstudium. Den andre gir et nytt,
   lite scenario, uten fasit. Presenter spørsmålet før dere åpner dokumentasjonen.
2. Kandidaten forklarer requestflyt, data og relevante sikkerhets-/feilgrenser.
3. Medstudenten spør: hvorfor dette valget, hvilket alternativ, hvilken kostnad, og
   hvilket endret krav ville snudd beslutningen?
4. Kandidaten gjør en liten endring eller finner en konkret feil. Kjør relevant test etterpå.
5. Bytt roller og før bare reelle observasjoner. Repeter hullet i en senere økt.

Vurderingshjelp, ikke karakterprediksjon: Var svaret korrekt? Hang forklaringen sammen?
Kunne studenten finne koden, teste antakelsen og forklare en avveining? En sterk muntlig
prestasjon er ikke å ramse flest verktøynavn. Ingen kan garantere karakter med denne malen.

## Retrospekt denne uken

Les siste Canvas-melding og den relevante delen av lærerens live-spørsmålsbank.
Banken selv er ikke hentet i dette grunnlaget. A14 sier at fremtidige spørsmål er
forberedelseshjelp, ikke forventning om å beherske langt fremtidig stoff. Deltakelse,
tekniske detaljer, refleksjon og anvendelse vektlegges. Pass er mulig; oppmøte og faktisk
bidrag må følges opp. Ikke bruk den gamle forenklingen «bare forrige uke» som absolutt regel.

Spørsmål/quiz og upubliserte fasiter i PDF-arkivet er ikke bevis på dagens tildelte oppgaver.
Bruk nye øvingsspørsmål eller studentenes egne forsøk. Ikke skriv adminløsninger inn i
studentenes refleksjoner eller leveranser.
