---
name: prosjektreview
description: Grundig review av en PR, en branch eller hele prosjektet etter docs/prosess/review-sjekkliste.md, kryssjekket mot krav, dokumentasjon, struktur, overkomplisering og lærerens Fullstækk-kurs. Bruk når Max ber om review, kodegjennomgang eller kontroll før merge.
---

# Prosjektreview

Kjører [review-sjekklisten](../../../docs/prosess/review-sjekkliste.md) som en workflow med
flere uavhengige reviewere og en verifisering av hvert funn. Reviewen retter ingenting.

## 1. Avklar omfang

- Argument er et PR-nummer: review diffen i PR-en (`gh pr diff <nr>`) og filene den berører.
- Argument er en branch: review `git diff main...<branch>`.
- Ingen argument eller «hele»: review hele prosjektet (app, docs, struktur).
Er omfanget uklart, spør Max før du starter.

## 2. Forbered

1. `git pull` i `../School` (bare lesing). Noter dato og nyeste Canvas-uttrekk.
2. Les sjekklisten, `AGENTS.md`, [emnekrav](../../../docs/emne/emnekrav.md) og
   [dokumentkartet](../../../docs/README.md).
3. Samle diff eller filliste. Sjekk om endringen berører UI (da gjelder punkt 9).

## 3. Kjør workflowen

Bruk Workflow-verktøyet (Max har gitt stående samtykke). Hold det under ti agenter:

| Reviewer | Sjekklistepunkt |
|---|---|
| Krav og dokumentasjon | 1 og 2: sporbarhet FK/AK, ingenting falt ut, dokumenter uten motstrid |
| Struktur og enkelhet | 3 og 4: plassering, død kode, overkomplisering, unødige avhengigheter |
| Fullstækk og emnekrav | 5: slå opp etter `School/ITF31619-Webapplikasjoner/fullstaekk/CLAUDE.md`, oppgi kurs, leksjon og fil:linje |
| Sikkerhet, tester og feil | 6, 7 og 8: tilgang i skrivehandler, validering, tester som kan feile, logging uten persondata |
| Brukergrensesnitt | 9, bare når UI er berørt |

Hver reviewer leverer funn i sjekklistens rapportformat. Deretter prøver én verifiserer per
reviewer å motbevise funnene mot faktisk kode og kilder; bare funn som står seg, rapporteres.
Avslutt med én fullstendighetskritiker: hva ble ikke sjekket, hvilken kilde ble ikke lest?

## 4. Rapporter

- På norsk, i terminalen. Funn rangert: blokkerende, bør rettes, forslag. Fil:linje og kilde.
- Skill funn fra smak, og si tydelig hva som ikke ble sjekket.
- Avslutt med 3–5 spørsmål Max skal kunne svare på uten KI om endringen
  (punkt 10). Still dem, og utfordre svarene etter regelen i `CLAUDE.md`.
- Rett ingenting før Max har godkjent hvilke funn som skal rettes.
- Kursmateriell siteres kort med kilde og kopieres aldri inn i repoet.
