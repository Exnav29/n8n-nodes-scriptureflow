# n8n-nodes-scriptureflow

An n8n community node package for [ScriptureFlow](https://scriptureflow-api-preview.pages.dev), a structured Scripture API for developers, ministries, educators, and automation builders.

> **Status:** The package is published to npm. Version `0.1.1` is the current npm release, and `0.1.2` is the prepared Creator Portal metadata release. This package has not been approved through the n8n Creator Portal and is not verified by n8n.

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

## Installation

Install `n8n-nodes-scriptureflow` as a community node package in n8n.

In n8n, open **Settings > Community nodes**, choose **Install**, enter:

```text
n8n-nodes-scriptureflow
```

Then confirm the installation and search for **ScriptureFlow** in the node picker.

For self-hosted npm-based installations, install the package in the n8n custom nodes location supported by your deployment, then restart n8n:

```bash
npm install n8n-nodes-scriptureflow
```

## Supported operations

The current package contains these operations:

- **Translation > Get Many** retrieves translation keys and metadata from `/translations.json` without hiding catalog statuses.
- **Book > Get Many** retrieves the books available for a Version Key and helps expose partial translation coverage.
- **Scripture > Get Verse** retrieves one structured book/chapter/verse lookup directly from `/api/verse`.
- **Scripture > Get Quick Verse** retrieves a verse selected at request time from `/api/quick-verse`; results may differ between executions.
- **Scripture > Get Generated Verse of the Day** retrieves the generated static `/{version}/random.json` resource and remains distinct from Quick Verse.

Raw ScriptureFlow JSON is returned by default. Catalog operations support conventional Return All/Limit controls. Scripture operations offer an optional `Simplify` boolean without inventing or paraphrasing Scripture text.

See [the node roadmap](docs/scriptureflow-node-roadmap.md) for deferred operations and release gates.

## Usage examples

### List available translations

1. Add the **ScriptureFlow** node to a workflow.
2. Set **Resource** to **Translation**.
3. Set **Operation** to **Get Many**.
4. Leave **Return All** enabled to list the available translation keys and metadata.

### Retrieve John 3:16 from en-lsv

1. Add the **ScriptureFlow** node to a workflow.
2. Set **Resource** to **Scripture**.
3. Set **Operation** to **Get Verse**.
4. Set **Version Key** to `en-lsv`.
5. Set **Book** to `John`, **Chapter** to `3`, and **Verse** to `16`.
6. Execute the node to retrieve the API-provided ScriptureFlow response with reference and version attribution.

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

Version `0.1.1` is published to npm with provenance, and the n8n community package scanner passed. Version `0.1.2` is prepared to add npm author email metadata for n8n Creator Portal submission. Future releases use npm trusted publishing/OIDC; normal pushes and pull requests do not publish the package. No Creator Portal approval has occurred.

Follow the [release checklist](docs/release-checklist.md) and review [publishing readiness](docs/publishing-readiness.md) before creating any release tag. Do not publish locally for the verified-submission path.

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
