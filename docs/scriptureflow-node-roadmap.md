# ScriptureFlow Node Roadmap

This roadmap describes the intended n8n community-node surface. It is not a statement that every operation is implemented, stable, published, or verified. Existing exploratory code remains subject to review and change before an npm release.

## Phase 1 foundation

- Maintain the official n8n-node package structure.
- Keep the package dependency-light with no runtime dependencies.
- Support the public preview without credentials.
- Default to `https://scriptureflow-api-preview.pages.dev`.
- Preserve ScriptureFlow response attribution and errors.
- Validate package metadata, lint, build, local development, and packaging.

## Planned Translation operations

- List Translations
- Get Public Catalog
- Get Translation Metadata
- List Books
- List Chapters
- Get Verse Index, including full arrays and split-index manifests

## Planned Scripture operations

- Get Verse
- Get Passage
- Lookup Reference
- Get Quick Verse
- Get Generated Verse of the Day

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

Before npm publication, review every existing operation against current n8n UX and verification guidance, complete local n8n testing, confirm no runtime dependencies, document all supported behavior, and publish only through an approved GitHub Actions provenance workflow.
