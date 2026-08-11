# CLAUDE.md

This is the **frontend** repo for the Stock/HPP business-finance project.

## Project status

No stack has been chosen yet and no application code exists. Don't assume a
framework or layout — ask the user before scaffolding anything.

## Relationship to sibling repos

This project is split across independent repos, each buildable and
deployable on its own with no shared code or path dependency between them:

- `stock-frontend` (this repo) — client-side UI
- `stock-backend` — API / business logic / data layer
- `stock-infrastructure` — CI/CD, deployment, IaC
- `stock-qa` — test plans, test automation
- `stock-business-analyst` — requirements, specs, source material (incl. the original HPP/business-finance notes)

Contracts between repos (API shapes, etc.) should be treated as external and
versioned/documented, not assumed from source.

## Working here

`.claude/` config (agents, hooks, skills, MCP) is kept identical across all
five repos on purpose, so any agent persona works the same way regardless of
which repo it's invoked in. Once a stack is chosen, update this file with
real build/lint/test commands and architecture notes.
