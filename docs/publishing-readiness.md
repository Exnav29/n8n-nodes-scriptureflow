# Publishing Readiness

## Current state

- Package status: narrowed v1 development surface
- npm status: `n8n-nodes-scriptureflow@0.1.0` published
- n8n verification status: not submitted and not verified
- Credentials: not required for the public preview
- Runtime dependencies: none

The tag-only `.github/workflows/publish.yml` workflow published `0.1.0` successfully with provenance. The temporary first-publish npm token was revoked, the GitHub `NPM_TOKEN` secret was removed, and the workflow token mapping has been removed. Future releases use npm trusted publishing/OIDC only. Normal pushes and pull requests do not trigger publishing. See the [release checklist](release-checklist.md) before creating any release tag.

The `package-readiness.yml` GitHub Actions workflow remains validation-only: it installs, lints, builds, and previews package contents without publishing.

The first tag workflow attempt stopped before publication because npm invoked `prepublishOnly` (`n8n-node prerelease`). The GitHub Actions publish command now uses `--ignore-scripts` after its explicit install, lint, build, and package-preview checks. The local `prepublishOnly` guard remains unchanged. A later workflow run published `0.1.0` successfully.

## Required before the next publication

- Confirm package ownership and npm name availability.
- Review the narrowed node operations and UX copy after local testing.
- Pass `npm run lint`, `npm run build`, and local `npm run dev` testing.
- Run the current n8n community package scanner against the published package.
- Confirm package metadata and public repository URLs.
- Confirm MIT licensing and complete README documentation.
- Confirm there are no runtime dependencies, credentials, secrets, or private URLs.
- Confirm npm trusted publishing remains configured for `Exnav29/n8n-nodes-scriptureflow` and workflow filename `publish.yml`.
- Publish a release from GitHub Actions, never from a local machine.
- Submit through the n8n Creator Portal only after the public npm package is ready.

## Explicit non-actions before release approval

- Do not run `npm publish`.
- Do not run `npm run release`.
- Do not create or push release tags until the [release checklist](release-checklist.md) is approved and complete.
- Do not configure npm credentials.
- Do not submit to the n8n Creator Portal.

## Bootstrap validation record

- `npm install`: passed after aligning ESLint with the current n8n-node CLI peer requirement.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run dev`: TypeScript watch started with zero errors. The first-run n8n installation did not finish within the automated startup window, so confirming the node in the `localhost:5678` nodes panel remains a manual interactive check.
- Community package scanner: not yet run; the published package is now available for scanning.
- npm audit: installation reported transitive development-tool findings that should be reassessed before release; no runtime dependencies were added.

## V1 cleanup status

- The exploratory chapters, range, static-index, split-index, fresh-random, guided-dropdown, formatted-output, metadata-wrapper, and custom error-item behavior has been removed from the v1 surface.
- Translation Get Many, Book Get Many, Get Verse, Get Quick Verse, and Get Generated Verse of the Day remain.
- The source folder is normalized to `ScriptureFlow`. The node files retain n8n's lint-required `Scriptureflow.node.*` naming while the UI display name remains `ScriptureFlow`; Linux CI must continue to validate the package path.
- Local n8n runtime loading, workflow execution, node-picker discovery, and picker/canvas icon appearance are confirmed.
- The GitHub Actions provenance workflow published `0.1.0` successfully. Creator Portal submission remains deferred.

## V1 cleanup validation record

- `npm install`: passed; npm still reports 18 transitive development-tool findings (7 moderate and 11 high) for later review.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm pack --dry-run --ignore-scripts`: passed with the normalized `dist/nodes/ScriptureFlow/Scriptureflow.node.js` manifest path.
- Compiled execution smoke tests passed against all five public endpoints, including raw catalog output, attributed Scripture output, simplified Quick Verse output, and a clear invalid-Version-Key failure.
- The local `n8n-local-dev` instance recognized the mounted `CUSTOM.scriptureflow` node and successfully executed an inactive smoke-test workflow containing all five v1 operations. No production or existing workflow was modified.
- The custom SVG is built and deployed with an exact `file:scriptureflow.svg` reference. Its blue-and-gold branding was manually confirmed in both the authenticated node picker and workflow canvas.
- Registry lookup confirms `n8n-nodes-scriptureflow@0.1.0` is published with the `latest` dist-tag.

## Manual local verification record

Manual local verification passed on 2026-06-22 at `http://localhost:5678`.

- The node appeared as **ScriptureFlow** with its custom blue-and-gold icon in both the node picker and canvas.
- Exactly five actions were present: Book Get Many; Scripture Get Generated Verse of the Day, Get Quick Verse, and Get Verse; and Translation Get Many.
- Translation Get Many returned 50 items, and Book Get Many completed successfully.
- Get Verse returned raw attributed ScriptureFlow JSON for `en-lsv`, John 3:16, including `ok: true`, `type: "verse_lookup"`, `version: "en-lsv"`, and `reference: "John 3:16"`.
- An invalid `en-lsb` Version Key produced `ScriptureFlow API request failed` and directed the user to `https://scriptureflow-api-preview.pages.dev/translations.json`.

These results cover local development only. npm publication of `0.1.0` is complete; the npm community package scanner, n8n verification, and Creator Portal submission remain incomplete or deferred as described above. Future publishing uses trusted publishing/OIDC, and the 18 transitive development-tool audit findings remain a release review item.
