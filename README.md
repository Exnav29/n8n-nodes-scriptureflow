# n8n-nodes-scriptureflow

The planned n8n community node package for [ScriptureFlow](https://scriptureflow-api-preview.pages.dev), a structured Scripture API for developers, ministries, educators, and automation builders.

> **Status:** Early scaffold and exploratory local development. This package is not published to npm, has not been submitted to the n8n Creator Portal, and is not verified by n8n. Operations and UX may change before the first public release.

## Public preview

- Base URL: `https://scriptureflow-api-preview.pages.dev`
- No API key is required during public preview.
- Future optional API-key support may be added when ScriptureFlow monetization and API-key support are ready.
- Discover exact, case-sensitive translation version keys from [`translations.json`](https://scriptureflow-api-preview.pages.dev/translations.json).
- Some translations may be partial; check available books before assuming coverage.

## Scripture data rules

- Do not silently substitute translations.
- Do not invent or paraphrase Scripture text.
- Preserve the returned reference and version attribution.
- Keep generated commentary separate from Scripture text.
- Surface ScriptureFlow API errors instead of filling in missing text.

## Planned node surface

The roadmap includes Translation discovery/catalog operations and Scripture lookup, passage, Quick Verse, and generated Verse of the Day operations. They are not all guaranteed to be implemented or release-ready yet.

See [the node roadmap](docs/scriptureflow-node-roadmap.md) for the planned operation list and release gates.

## Credentials

No credentials are required for public preview mode. A future optional API key credential may be introduced later; any API key or token field will be stored as a sensitive/password field.

## Development

This repository uses the official n8n-node package structure and CLI commands.

```bash
npm install
npm run lint
npm run build
npm run dev
```

`npm run dev` starts an interactive local n8n development session, normally at `http://localhost:5678`. It is intended for manual node discovery and workflow testing.

The package has no runtime dependencies. `n8n-workflow` is declared as a peer dependency, and build/lint tooling is kept in development dependencies.

## Publishing status

Nothing in this bootstrap publishes the package. Do not run `npm publish` or `npm run release` until package ownership, operations, UX, documentation, tests, and GitHub Actions provenance are reviewed.

See [publishing readiness](docs/publishing-readiness.md) for the remaining release and verification gates.

## ScriptureFlow resources

- [API preview](https://scriptureflow-api-preview.pages.dev)
- [OpenAPI 3.1 contract](https://scriptureflow-api-preview.pages.dev/openapi.yaml)
- [Swagger API Reference](https://scriptureflow-dev-docs.pages.dev/api-reference/)
- [Postman collection](https://documenter.getpostman.com/view/1355224/2sBXwvJoj6)
- [n8n examples](https://scriptureflow-dev-docs.pages.dev/integrations/n8n)
- [Public code examples](https://scriptureflow-dev-docs.pages.dev/examples/example-requests.html)
- [AI usage guide](https://scriptureflow-dev-docs.pages.dev/ai/using-scriptureflow-with-ai.html)

## License

[MIT](LICENSE)
