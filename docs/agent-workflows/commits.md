# Commits and simplification

Use this workflow only when the user explicitly asks for a commit.

Before committing, review the proposed diff for reusable abstractions, public
API compatibility, unnecessary complexity, Svelte 5 conventions, semantic
token reuse, and focused tests. Avoid unrelated refactors.

Inspect status, branch, recent messages, and the complete diff. Stop for
secrets, empty or ambiguous scope, and accidental generated output. Run the
checks in `AGENTS.md`, including `pnpm package` for public-library changes.
Update the README when exports, components, themes, or consumer guidance change.

Stage named files only. Match the repository's commit style; do not add agent
attribution, skip hooks, amend published commits, or push unless separately
asked.
