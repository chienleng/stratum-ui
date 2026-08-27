# Stratum UI agent guide

This is the canonical guidance for any coding agent working in this repository.
Platform-specific instruction files must defer here rather than duplicate it.

## Start here

- Read `README.md` before changing a component contract, export, theme, or token.
- Preserve unrelated working-tree changes and keep changes focused.
- This is a published library: treat exports, CSS custom properties, and rendered
  markup as public API.

## Commands and verification

- Use the pinned `pnpm` version through Corepack.
- `pnpm dev` serves the demo at `http://stratum-ui.localhost:7604`.
- Run `pnpm test:unit -- --run` for behaviour changes.
- Run `pnpm check` after TypeScript or Svelte changes and `pnpm lint` when
  formatting or linting is relevant.
- Run `pnpm package` after changes to exports, components, themes, or package
  metadata; it runs `svelte-package` and `publint`.
- Do not run `pnpm format` across unrelated files without permission.

## Project rules

- Use Svelte 5 runes and property event handlers in new code.
- Keep components accessible and preserve Bits UI keyboard/focus semantics.
- Keep library source under `src/lib`; the demo site is a consumer, not the
  source of exported behaviour.
- Export public modules through the appropriate subpath barrel and keep
  `package.json` exports aligned.
- Add new icons to the `./icons` barrel (`src/lib/icons/index.ts`) and tell
  consumers to import from it, never from per-file paths like
  `@chienleng/stratum-ui/icons/X.svelte`: Vite 8's Rolldown dependency scanner
  cannot resolve the relative `./Icon.svelte` imports inside deep-imported
  `.svelte` files and skips pre-bundling entirely. The `./icons/*` export
  remains only for backwards compatibility. The demo site is exempt because
  its aliases resolve to `src/lib` source files, which the scanner handles.
- Themes are CSS custom-property contracts. Reuse semantic `--su-*` tokens and
  verify light, dark, and forced `data-mode` behaviour.
- Add focused tests beside the behaviour they cover.

## Git and release safety

- Do not commit, tag, publish, push, or deploy unless explicitly asked.
- Before a commit, simplify the diff for reuse, clarity, Svelte 5 conventions,
  and focused tests. Do not turn this into an unrelated refactor.
- Stage named files only; never use broad `git add` commands.
- Never skip hooks, amend published commits, force-push, or add agent attribution.
- Follow `docs/agent-workflows/commits.md`, `svelte-5-review.md`, and
  `releases.md` when those workflows apply.
