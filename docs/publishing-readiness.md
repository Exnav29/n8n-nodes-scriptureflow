# Publishing Readiness

## Current state

- Package status: early scaffold and exploratory local development
- npm status: not published
- n8n verification status: not submitted and not verified
- Credentials: not required for the public preview
- Runtime dependencies: none

No workflow in this repository currently publishes to npm. The `package-readiness.yml` GitHub Actions workflow only installs, lints, builds, and previews package contents.

## Required before publication

- Confirm package ownership and npm name availability.
- Review all node operations and UX copy.
- Pass `npm run lint`, `npm run build`, and local `npm run dev` testing.
- Pass the current n8n community package scanner.
- Confirm package metadata and public repository URLs.
- Confirm MIT licensing and complete README documentation.
- Confirm there are no runtime dependencies, credentials, secrets, or private URLs.
- Add an official GitHub Actions npm publishing workflow with provenance in a separate reviewed change.
- Configure npm trusted publishing or narrowly scoped publishing credentials without committing secrets.
- Publish a release from GitHub Actions, never from a local machine.
- Submit through the n8n Creator Portal only after the public npm package is ready.

## Explicit non-actions for this bootstrap

- Do not run `npm publish`.
- Do not run `npm run release`.
- Do not create or push release tags.
- Do not configure npm credentials.
- Do not submit to the n8n Creator Portal.

## Bootstrap validation record

- `npm install`: passed after aligning ESLint with the current n8n-node CLI peer requirement.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run dev`: TypeScript watch started with zero errors. The first-run n8n installation did not finish within the automated startup window, so confirming the node in the `localhost:5678` nodes panel remains a manual interactive check.
- Community package scanner: deferred because the scanner resolves a package from npm and `n8n-nodes-scriptureflow` is intentionally not published yet.
- npm audit: installation reported transitive development-tool findings that should be reassessed before release; no runtime dependencies were added.
