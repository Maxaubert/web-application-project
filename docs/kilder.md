# Kildeindeks og oppdatering

## Autoritet

Nyeste relevante Canvas-presisering + gjeldende kursplan styrer kravene. Deretter
årets fagmateriale og lærerens aktuelle gjennomgang. Historiske 2025-opptak forklarer
pedagogiske intensjoner, ikke årets frister eller tekniske minstekrav. Egne notater
er syntese. Offisiell teknisk dokumentasjon avklarer API-atferd, ikke hva som skal leveres.

**Sist kontrollert: 14.09.2026.** K01/K02 og alle 12 tilgjengelige kunngjøringer ble
hentet med kursavgrensede lesekall, paginering fulgt. K01 sist endret 14.08.2026,
K02 03.09.2026. Ingen vurderingsstatus, privat innboks eller andre emner ble undersøkt.

**Målrettet KI-kontroll 19.09.2026:** K02 er hentet på nytt fra Canvas og bevart som
[lærerens tekst](ki-avtale-canvas.md), sist endret 03.09.2026 kl. 12:37 norsk tid.
Kursplanens KI-føringer og alle 12 tilgjengelige kunngjøringer ble kontrollert for
presiseringer, med paginering fulgt. Ingen motstridende KI-presisering ble funnet
i disse kildene. Gruppeenighet om KI-bruk og gruppekontrakt i tillegg til KI-avtalen
bekreftes fortsatt av A04/A29. Dette er ikke en ny kontroll av alle emnekrav eller frister.
Metadata og hash av Canvas-sidens HTML-innhold ligger i [kildemanifestet](kildemanifest.json).

| ID | Primærkilde | Bruk |
|---|---|---|
| K01 | [Canvas kursplan](https://hiof.instructure.com/courses/11084/pages/webapp-kursplan) | §8 arbeidskrav 0–5, teknisk minimum; §9 vurdering; §10 fravær; §11 sign off; §12 eksamen |
| K02 | [Canvas KI-avtale](https://hiof.instructure.com/courses/11084/pages/ki-avtale), [hentet tekst](ki-avtale-canvas.md) | Fire områder: bruk, egen ferdighet, verifikasjon, avtale i repo. Kildetekst, ikke gruppens tilslutning |
| A14 | [Retrospektpresisering 14.09](https://hiof.instructure.com/courses/11084/discussion_topics/173533) | Kommende stoff, pass, teknikk/refleksjon/anvendelse og deltakelse |
| A11 | [Grupper og forventninger 11.09](https://hiof.instructure.com/courses/11084/discussion_topics/173430) | Grupper låst, endringer avklares, større bredde/dybde i lyntaler |
| A08 | [Nye gruppeoversikter 08.09](https://hiof.instructure.com/courses/11084/discussion_topics/173210) | Gamle lyntaletider må oppdateres |
| A04 | [Arbeidsform 04.09](https://hiof.instructure.com/courses/11084/discussion_topics/172881) | Enighet om ambisjon, arbeidsform, tema, KI og bidrag |
| A29 | [Gruppekontrakt 29.08](https://hiof.instructure.com/courses/11084/discussion_topics/172374) | Gruppekontrakt i tillegg til KI-avtale |
| U26 | Lokal `webapp-2026-journey.txt`, 374 sidemarkører | Årets undervisning, teknisk utdyping og øvingsspesifikke regler |
| H25 | Utvalgte lokale 2025-transkripter, se nedenfor | Historisk læringssyn og strukturprinsipper |

Canvas krever innlogging. U26 og H25 er bevisst ikke kopiert hit. På opphavsmaskinen
finnes de under søsterrepoet `School/ITF31619-Webapplikasjoner/kursmateriell/`.
Hvis Emil ikke har materialet lokalt: bruk autorisert kursplattform og sidereferansene,
ikke be ham klone private arkiv eller dele påloggingsopplysninger.

## Presise lokale referanser

U26 betyr `tekst/webapp-2026-journey.txt`. Sidetall er `<<<PAGE n>>>` i denne
tekstutgaven, ikke en antatt PDF-visningsforskyvning. Hash og sidetall ligger i
[kildemanifestet](kildemanifest.json), slik at senere endringer kan oppdages.

| Emne | U26 sider og linjer ved kontroll |
|---|---|
| Frivillige øvinger kontra krav | s. 9 l. 329–330; s. 56 l. 1983–1984 |
| Egen requestforklaring, TDD/refleksjon og agentreview | s. 26 l. 974–975; s. 43–44 l. 1531–1543; s. 56–57 l. 1985–2008 |
| Tilgangskontroll i actions, ikke bare ruter | s. 69, 224, 283–285 |
| Egen middlewareforklaring, peer review, SDD-begrunnelse | s. 77 l. 2770–2772; s. 146 l. 5190–5198; s. 158 l. 5568–5571 |
| Egen etisk refleksjon anbefales | s. 167 l. 5911–5917 |
| To første testversjoner uten KI i L8a | s. 201 l. 7155–7173 |
| Retningslinjedokument uten KI-generert tekst i L9 | s. 213 l. 7503–7514 |
| Canvas overstyrer, egen app og lokalkjøring | s. 229 l. 8061–8078 |
| Tekniske krav og rapportens egen arkitekturbegrunnelse | s. 230 l. 8082–8108 |
| Presentasjon, data og aktiv rolle | s. 230–231 l. 8109–8164 |
| Prinsipper kontra valgfrie utvidelser | s. 232 l. 8193–8201; s. 236,254,276,298,315 |
| Motstridende authøving | s. 261–262 anbefaler direkte auth-fetch for Set-Cookie; s. 269–270 ber om actions |

Læringskartet viser øvrige leksjoner og sider. Denne kontrollen omfatter ikke at
alle lenker inne i kursarkivet virker eller at alle kodeeksempler er kjørt.
Eksempel på kjente kilderisikoer: tidlige ufullstendige kodesnutter; ulike authoppskrifter;
utdaterbare modellpriser, juridiske tidslinjer og leverandørbegrensninger.
Verifiser slike fakta mot offisielle kilder før de brukes som dagens fakta.

H25 betyr `notion-2025-arkiv/`. Kildeagenten kontrollerte disse tekststedene 14.09.2026:

| Fil relativt til H25 | Linjer | Pedagogisk observasjon, historisk |
|---|---|---|
| `leksjon-04/transkript/video1591632156.txt` | 249–278,313–317 | Skille ferdig oppgave fra læring; hint/forklaring uten å la nybegynnere stå fast |
| `leksjon-08/transkript/video1530392709.txt` | 95–103,274–308 | Transkripsjon, tilpasset KI-forklaring, forståelse og øving |
| `leksjon-14/transkript/video1354695546.txt` | 100–128,387–411 | Liten app trenger ikke alle demolag; meningsfull konsistent struktur |
| `leksjon-16/transkript/video1543013686.txt` | 224–243,543–608 | Naturlige grenser, refaktorering og tegn/forklar requestflyten |

Maskintranskripsjon kan være feil. Ikke utled en streng regel fra et enkelt rart ord.
Historiske Prisma-/API-versjons-/React-valg erstatter ikke Canvas 26H.

## Slik oppdateres krav uten å miste historikken

1. Før milepæl eller ved ny melding: les K01, K02 og nye kunngjøringer. Kontroller aktuell
   gruppe-/lyntaleoversikt og eksamensdato separat. Noter hva som faktisk ble lest.
2. For API på opphavsmaskinen: les først `School/canvas-api.md`. Bruk bare kurs 11084,
   én forespørsel om gangen, følg Link-paginering. Hent kjent kursplanside direkte.
   Tom `/assignments` betyr ikke at Webapplikasjoner mangler arbeidskrav.
3. Token leses bare ved behov fra godkjent lokal hemmelighetskilde i prosessminnet.
   Ikke skriv token, autorisasjonsheader eller full API-respons til repo/logg/chat.
4. Sammenlign med kildemanifestet. Endre relevant krav-ID, kilde, kontrolltidspunkt,
   konflikt og påvirket prosjektplan. Ikke omnummerer ID-er fordi ordlyd endres.
5. Tidspunkter fra API er UTC: konverter med Europe/Oslo, også vintertid. Ikke legg
   alltid til to timer. Bruk faktisk `missing` hvis studentstatus senere undersøkes.
6. Dokumenter usikkerhet ved manglende tilgang. Si «ikke kontrollert» fremfor å anta.
   Ta reell konflikt til faglærer; assistenten kan lage utkast, men sender ikke uten fullmakt.
7. Oppdater sporbarhet og kjør docsjekken. La den andre studenten kontrollere endringen.

Ingen automatisk Canvas-overvåking er opprettet. Rå kursarkiv og eventuelle administrative
fasiter hører ikke hjemme i studentenes vurderingsleveranser eller offentlige repo.
