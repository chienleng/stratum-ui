# Releases and publishing

Use this procedure only when the user explicitly asks to release or publish the
package.

1. Confirm `main`, a clean tree, remote alignment, npm authentication, the
   requested `patch`/`minor`/`major` bump, and the commits that will ship.
2. Simplify the diff per `commits.md`, then run `pnpm lint`, `pnpm check`,
   `pnpm test:unit -- --run`, and `pnpm package`.
3. Inspect the generated package and exported subpaths. Ensure no tests, demo
   code, local assets, or unintended files enter `dist`.
4. Run `pnpm version patch|minor|major`; verify the version commit and `v*` tag.
5. Run `pnpm publish` only with explicit confirmation that publishing to npm is
   intended. Never use `--no-git-checks` or a different registry casually.
6. Push `main` and the tag only when explicitly authorised. Never force-push.
7. Confirm the npm version and report the published version and tag.

The demo site's `wrangler.jsonc` is separate from npm publishing. Do not deploy
it as an implicit part of a package release unless the user asks.
