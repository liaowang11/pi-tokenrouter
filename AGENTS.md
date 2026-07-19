# Repository Guidelines

## Project Structure & Module Organization

`index.ts` registers TokenRouter with `pi`. `provider-config.ts` builds provider configuration, while `model-catalog.ts` maps upstream catalog data. Generate the checked-in `models.generated.ts` snapshot with `scripts/generate-models.mjs`; do not edit it manually. Tests live in `test/`, and workflows are under `.github/workflows/`.

## Build, Test, and Development Commands

- `npm install` installs development and peer dependencies.
- `npm exec tsc -- --noEmit` runs the same strict type check used by CI on Node 20 and 22.
- `TOKENROUTER_API_KEY=... npm run generate-models` refreshes `models.generated.ts` from TokenRouter, models.dev, and OpenRouter. Review the generated diff before committing.
- `pi -e /absolute/path/to/pi-tokenrouter` loads the local extension for manual testing; use `/login tokenrouter` to configure credentials.

There is currently no `npm test` script. To execute the assert-based test, compile it to a temporary directory, then run the emitted JavaScript:

```sh
test_output_dir=$(mktemp -d)
npm exec tsc -- --noEmit false --outDir "$test_output_dir" --rootDir . --module Node16 --moduleResolution Node16 --target ES2022 --strict --skipLibCheck model-catalog.ts provider-config.ts test/tokenrouter-provider.test.ts
node "$test_output_dir/test/tokenrouter-provider.test.js"
```

## Coding Style & Naming Conventions

Match the existing TypeScript style: four-space indentation, semicolons, double quotes, trailing commas in multiline structures, and explicit exported types. Use `camelCase` for functions and variables, `PascalCase` for types, and `UPPER_SNAKE_CASE` for constants. Keep changes focused; no formatter or linter is configured, so avoid unrelated whitespace churn.

## Testing Guidelines

Tests use Node's strict `assert` module and should be named `*.test.ts`. Add the smallest focused assertion for changed mapping or routing behavior. Run both the test command above and the CI type check. Do not weaken existing assertions.

## Commit & Pull Request Guidelines

History favors short, imperative subjects with Conventional Commit prefixes where useful, such as `fix: route Anthropic models correctly`. Keep commits scoped. Pull requests should explain the change, list verification commands, link relevant issues, and call out regenerated model data.

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
