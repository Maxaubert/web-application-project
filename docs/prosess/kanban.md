# Kanban-flyt

Max 05.10.2026: hver funksjon eller retting står på [Kanban-boardet](https://github.com/users/Maxaubert/projects/1)
før den implementeres, og flyttes gjennom kolonnene etter hvert som arbeidet går.

| Kolonne | Når |
|---|---|
| To do | Issue er opprettet og lagt på boardet, før noe arbeid starter. |
| In progress | Arbeidet starter (branch opprettet, planen godkjent). |
| Review | PR-en er åpnet og venter på håndtest og «merge?». |
| Done | PR-en er merget. Lukkede issues flyttes hit automatisk eller for hånd. |

Én branch per issue, alltid fra `main` (`type/nr-slug`, for eksempel `feat/47-innlogging`).
`develop` er avviklet 05.10.2026; `main` er eneste faste branch.

## Kommandoer

```powershell
gh issue create --project Kanban --title "..." --body "..."
gh project item-edit 1 --owner Maxaubert --url <issue-URL> --field Status --value "In progress"
gh issue view <nr> --json projectItems --jq '.projectItems[].status.name'
```

Verdiene for Status er nøyaktig `To do`, `In progress`, `Review` og `Done`.
