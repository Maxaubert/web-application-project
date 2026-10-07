# Kanban-flyt

Max 05.10.2026: hver funksjon eller retting står på [Kanban-boardet](https://github.com/users/Maxaubert/projects/1)
før den implementeres, og flyttes gjennom kolonnene etter hvert som arbeidet går.

| Kolonne | Når |
|---|---|
| To do | Issue er opprettet og lagt på boardet, før noe arbeid starter. |
| In progress | Arbeidet starter (branch opprettet, planen godkjent). |
| Review | PR-en til `develop` er åpnet og venter på håndtest og «merge?». |
| Done | PR-en er merget til `develop`. Lukkede issues flyttes hit automatisk eller for hånd. |

## Brancher (Max 05.10.2026)

- `main` er det leverte, stabile. `develop` er integrasjonsbranchen.
- Én branch per issue, alltid fra `develop` (`type/nr-slug`, for eksempel `feat/52-annonser`).
  PR-en går til `develop` og squash-merges etter Max' godkjenning.
- Når `develop` er klar, åpnes en egen PR `develop` → `main`. Den merges med **merge commit**,
  ikke squash, ellers glir historikken i `develop` og `main` fra hverandre og gir konflikter.
- CI kjører på PR-er og push til både `develop` og `main`. `main` har full grenbeskyttelse: PR og grønn
  `Repository checks` kreves, også for admin; review er frivillig. `develop` har lett beskyttelse
  (Max 07.10.2026): sletting og omskriving av historikk blokkeres, men GitHub krever ikke PR. Arbeidsregelen
  over gjelder likevel: alle endringer går via PR.

## Kommandoer

```powershell
gh issue create --project Kanban --title "..." --body "..."
gh project item-edit 1 --owner Maxaubert --url <issue-URL> --field Status --value "In progress"
gh issue view <nr> --json projectItems --jq '.projectItems[].status.name'
```

Verdiene for Status er nøyaktig `To do`, `In progress`, `Review` og `Done`.
