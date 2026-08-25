# n8n-nodes-scriptureflow

[![npm version](https://img.shields.io/npm/v/n8n-nodes-scriptureflow)](https://www.npmjs.com/package/n8n-nodes-scriptureflow)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![n8n community node](https://img.shields.io/badge/n8n-community%20node-ff6d5a)](https://www.npmjs.com/package/n8n-nodes-scriptureflow)

**Structured Scripture in n8n workflows — without asking an LLM to reproduce Bible text from memory.**

`n8n-nodes-scriptureflow` is a community node package for [ScriptureFlow](https://scriptureflow-api-preview.pages.dev), a structured Scripture API for developers, ministries, educators, and automation builders.

Use it when a workflow needs an attributable Scripture source of truth before AI, formatting, messaging, storage, or downstream automation.

> **Status:** The package is published to npm. Version `0.1.1` is the current npm release, and `0.1.2` is the prepared Creator Portal metadata release. This package has not been approved through the n8n Creator Portal and is not verified by n8n.

## Why ScriptureFlow?

A language model can generate commentary, summaries, questions, and study material. It should not be treated as the authoritative source for Scripture text.

ScriptureFlow keeps those responsibilities separate:

- **Scripture comes from the API.**
- **Reference and version attribution stay attached to the returned text.**
- **Missing content stays missing instead of being invented.**
- **AI-generated commentary remains distinguishable from source Scripture.**
- **Upstream API errors are surfaced rather than silently replaced.**

That makes the node useful for Bible-study workflows, ministry automations, education tools, devotional pipelines, and AI-assisted applications that need a reliable source layer.

## A simple workflow

```text
Schedule Trigger
      ↓
ScriptureFlow
      ↓
Format / AI commentary
      ↓
Email · Slack · Notion · Database
```

The important boundary is the middle one: downstream tools may transform, discuss, route, or store the result, but they do not become the source of the Scripture text.

See [`examples/README.md`](examples/README.md) for three starter workflow patterns.

## Installation

Install `n8n-nodes-scriptureflow` as a community node package in n8n.

In n8n, open **Settings > Community nodes**, choose **Install**, enter:

```text
n8n-nodes-scriptureflow
```

Then confirm the installation and search for **ScriptureFlow** in the node picker.

For self-hosted npm-based installations, install the package in the custom nodes location supported by your n8n deployment, then restart n8n:

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

## Quick examples

### List available translations

1. Add the **ScriptureFlow** node to a workflow.
2. Set **Resource** to **Translation**.
3. Set **Operation** to **Get Many**.
4. Leave **Return All** enabled to list the available translation keys and metadata.

### Retrieve John 3:16 from `en-lsv`

1. Add the **ScriptureFlow** node to a workflow.
2. Set **Resource** to **Scripture**.
3. Set **Operation** to **Get Verse**.
4. Set **Version Key** to `en-lsv`.
5. Set **Book** to `John`, **Chapter** to `3`, and **Verse** to `16`.
6. Execute the node to retrieve the API-provided ScriptureFlow response with reference and version attribution.

## Public preview

- Base URL: `https://scriptureflow-api-preview.pages.dev`
- No API key is required during public preview.
- Future optional API-key support may be added when ScriptureFlow monetization and API-key support are ready.
- Discover exact, case-sensitive translation version keys from [`translations.json`](https://scriptureflow-api-preview.pages.dev/translations.json).
- Some translations may be partial; check available books before assuming coverage.

## Scripture data rules

Contributions and new operations should preserve these invariants:

1. Do not silently substitute translations.
2. Do not invent or paraphrase Scripture text.
3. Preserve the returned reference and version attribution.
4. Keep generated commentary separate from Scripture text.
5. Surface ScriptureFlow API errors instead of filling in missing text.

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

## Contributing

Useful contributions are welcome, especially around additional retrieval operations, examples, tests, documentation, and failure handling.

Before opening a pull request, read [`CONTRIBUTING.md`](CONTRIBUTING.md). The Scripture data rules above are product invariants, not optional style preferences.

If you want a contained place to start, check the repository issues for work labeled `good first issue` or `help wanted`.

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
