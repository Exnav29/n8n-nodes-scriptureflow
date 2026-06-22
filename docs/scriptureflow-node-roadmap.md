# ScriptureFlow Node Roadmap

This roadmap separates the implemented v1 target from later operations. The package remains unpublished and unverified.

The keep/defer/remove decisions from the [v1 scope audit](v1-scope-audit.md) were applied in the v1 cleanup.

## Phase 1 foundation

- Maintain the official n8n-node package structure.
- Keep the package dependency-light with no runtime dependencies.
- Support the public preview without credentials.
- Default to `https://scriptureflow-api-preview.pages.dev`.
- Preserve ScriptureFlow response attribution and errors.
- Validate package metadata, lint, build, local development, and packaging.

## V1 target operations

- Translation > Get Many: `/translations.json`
- Book > Get Many: `/{version}/books.json`
- Scripture > Get Verse: `/api/verse`
- Scripture > Get Quick Verse: `/api/quick-verse`
- Scripture > Get Generated Verse of the Day: `/{version}/random.json`

These operations use explicit Version Key and structured reference fields. They return raw ScriptureFlow JSON by default and do not use static-index traversal, generated fallback text, or custom response wrappers.

## Deferred operations and behavior

- Public catalog and translation metadata
- List chapters
- Get passage/range
- Free-text reference lookup
- Verse-index and split-index traversal
- Guided chained dropdowns
- Client-side random selection
- Plain-text and formatted-citation output modes

Quick Verse and generated Verse of the Day must remain separate operations because Quick Verse is selected at request time while `/{version}/random.json` is a generated translation resource.

## Credential and base URL plan

- Phase 1: no credentials required for public preview.
- Default base URL: `https://scriptureflow-api-preview.pages.dev`.
- Later: optional API key credential when ScriptureFlow API-key or monetization support is available.
- Any future API key or token field must be sensitive/password-protected.
- A custom base URL may be considered for testing or self-hosted environments.

## Safety and output principles

- Discover exact version keys through `/translations.json`.
- Never silently substitute translations.
- Never invent or paraphrase Scripture text.
- Preserve returned reference and version attribution.
- Keep generated commentary separate from Scripture text.
- Surface API errors and partial-translation gaps clearly.
- Adapt the node to ScriptureFlow responses rather than changing the API for the node.

## Release gates

Before npm publication, complete local n8n panel and workflow testing, review outstanding npm audit findings, confirm no runtime dependencies, validate documentation, and publish only through an approved GitHub Actions provenance workflow. The npm package scanner remains deferred until a package exists in npm, and Creator Portal submission remains a later phase.
