# Repository Guidelines

## Project Structure & Module Organization

`index.ts` registers TokenRouter with `pi` and refreshes the model catalog in the background. `provider-config.ts` builds provider configuration, `model-catalog.ts` maps upstream catalog data, and `model-loader.ts` fetches and caches the live catalog at runtime. The checked-in `models.generated.ts` snapshot is a frozen first-run fallback; do not edit it manually. Tests live in `test/`, and workflows are under `.github/workflows/`.

## Build, Test, and Development Commands

- `npm install` installs development and peer dependencies.
- `npm test` runs the strict type check plus the assert-based tests.
- `pi -e /absolute/path/to/pi-tokenrouter` loads the local extension for manual testing; use `/login tokenrouter` to configure credentials.

## Coding Style & Naming Conventions

Match the existing TypeScript style: four-space indentation, semicolons, double quotes, trailing commas in multiline structures, and explicit exported types. Use `camelCase` for functions and variables, `PascalCase` for types, and `UPPER_SNAKE_CASE` for constants. Keep changes focused; no formatter or linter is configured, so avoid unrelated whitespace churn.

## Testing Guidelines

Tests use Node's strict `assert` module and should be named `*.test.ts`. Add the smallest focused assertion for changed mapping or routing behavior. Run `npm test`. Do not weaken existing assertions.

## Commit & Pull Request Guidelines

History favors short, imperative subjects with Conventional Commit prefixes where useful, such as `fix: route Anthropic models correctly`. Keep commits scoped. Pull requests should explain the change, list verification commands, and link relevant issues.

## Releases

Pushing a `v*` tag triggers `.github/workflows/publish.yml`, which type-checks and publishes to npm. Ensure `package.json`, `package-lock.json`, and the tag use the same version. For a patch release:

```sh
npm version patch
git push origin main
git push origin vX.Y.Z
```

Use `minor` or `major` when appropriate. `npm version` creates the version commit and tag; replace `vX.Y.Z` with that tag. Never move or reuse a published tag. Confirm the Publish workflow succeeds.

## Security & Configuration

Never commit API keys or `.env` contents. Use `TOKENROUTER_API_KEY` locally and keep authentication material outside generated files and test fixtures.
