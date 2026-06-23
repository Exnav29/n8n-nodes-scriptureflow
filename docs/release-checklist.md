# ScriptureFlow n8n Node Release Checklist

This checklist prepares controlled npm releases of `n8n-nodes-scriptureflow`. Version `0.1.1` is published, and version `0.1.2` is prepared to add npm author email metadata for n8n Creator Portal submission. The package has not been approved through the n8n Creator Portal and is not verified by n8n.

The verified-submission path must publish from the GitHub Actions workflow in `.github/workflows/publish.yml` with npm provenance. Do not use a local `npm publish` for that path.

## Before publishing

### npm account and package readiness

- [ ] Confirm the publishing npm account is active, has a verified email address, uses two-factor authentication, and is authorized to publish the package.
- [ ] Confirm the package name remains `n8n-nodes-scriptureflow` and check its current registry status with `npm view n8n-nodes-scriptureflow`.
- [ ] Confirm the version in `package.json` is the intended release version and does not already exist in npm.
- [ ] Confirm the public repository URL in `package.json` is exactly `git+https://github.com/Exnav29/n8n-nodes-scriptureflow.git`.
- [ ] Confirm npm author metadata includes `Johnathan Lightfoot <johnathan@bulletproofautomations.com>` for Creator Portal contact lookup.
- [ ] Confirm the package is MIT licensed, has no runtime dependencies, includes `n8n-community-node-package`, and documents the supported operations.
- [ ] Review the outstanding npm audit findings in development tooling and decide whether release-blocking remediation is needed.

### npm trusted publisher configuration

- [ ] Before each release, confirm the npm package settings have a GitHub Actions trusted publisher with:
  - Organization or user: `Exnav29`
  - Repository: `n8n-nodes-scriptureflow`
  - Workflow filename: `publish.yml`
  - Allowed action: `npm publish`
- [ ] Do not enter `.github/workflows/publish.yml` in npm's workflow field; npm expects the filename only.
- [ ] Confirm the trusted publisher configuration remains active before pushing a release tag.
- [ ] Confirm the workflow uses a GitHub-hosted runner and has `id-token: write` and `contents: read` permissions.
- [ ] Confirm the release runner provides Node.js 24 and npm 11.5.1 or later.
- [ ] Confirm the package owner has permission to publish `n8n-nodes-scriptureflow`.

### First publish bootstrap record

- [x] `n8n-nodes-scriptureflow@0.1.0` was published successfully from GitHub Actions with provenance.
- [x] The temporary first-publish npm token was revoked.
- [x] The GitHub Actions `NPM_TOKEN` repository secret was removed.
- [x] npm trusted publishing was configured for `Exnav29/n8n-nodes-scriptureflow`, workflow `publish.yml`, with `npm publish` allowed.

The token bootstrap has been removed from the workflow. Future releases authenticate only through npm trusted publishing/OIDC. Do not publish locally.

### 0.1.1 trusted publishing retry record

The `v0.1.1` GitHub Actions publish attempt reached `npm publish --provenance --access public --ignore-scripts`, built the tarball, and signed provenance, but npm rejected the final package write with an `E404` permission/not-found response for `n8n-nodes-scriptureflow@0.1.1`.

Repository-side checks show the workflow uses a GitHub-hosted runner, has `contents: read` and `id-token: write`, uses Node.js 24, verifies npm 11.5.1 or later, does not use `NPM_TOKEN`, and publishes the unchanged package name `n8n-nodes-scriptureflow`. After the workflow guard stopped treating generic `NODE_AUTH_TOKEN` presence as a legacy token path, `0.1.1` published successfully with provenance and the scanner passed.

### Final validation

- [ ] Pull the intended release commit and verify the worktree is clean.
- [ ] Run `npm ci`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm pack --dry-run --ignore-scripts` and inspect every packaged file.
- [ ] Confirm the five v1 actions and custom icon still pass local n8n verification.
- [ ] Confirm there are no secrets, tokens, private URLs, credentials, runtime dependencies, or unexpected generated files.
- [ ] Confirm the package version and release tag will match, for example package version `0.1.2` and tag `v0.1.2`.

## Publish

- [ ] Merge all approved release-preparation changes to `main`.
- [ ] Create an annotated release tag from the exact approved `main` commit, for example `git tag -a v0.1.2 -m "Release v0.1.2"`.
- [ ] Recheck the tag target before pushing it.
- [ ] Push only the intended tag, for example `git push origin v0.1.2`.
- [ ] Watch the **Publish to npm with provenance** GitHub Actions run.
- [ ] Confirm dependency installation, lint, build, and package preview pass before the publish step.
- [ ] Confirm `npm publish --provenance --access public --ignore-scripts` succeeds through trusted publishing/OIDC.

The workflow intentionally uses `--ignore-scripts` for the publish command because it already runs dependency installation, lint, build, and dry-run package inspection first. This bypasses the package's `prepublishOnly` local guard only in the controlled GitHub Actions path. The `prepublishOnly` script remains in `package.json`, so accidental local `npm publish` remains blocked.

The first `v0.1.0` workflow attempt failed before publication because `prepublishOnly` blocked it. After the workflow added `--ignore-scripts`, version `0.1.0` published successfully with provenance. The local `prepublishOnly` guard remains in place.

Pushing a matching `v*.*.*` tag is the action that starts the publish workflow. Normal branches, pull requests, and ordinary pushes do not trigger it.

## After publishing

- [ ] Open the npm package page and confirm the expected version, README, MIT license, repository link, keywords, files, and provenance attestation.
- [ ] Confirm npm trusted publishing remains configured for future releases.
- [ ] Install the published package in a clean local/self-hosted n8n environment and repeat the five-operation smoke test.
- [ ] Run `npx @n8n/scan-community-package n8n-nodes-scriptureflow` against the published package and review every finding.
- [ ] Address scanner or package metadata findings before requesting verification.
- [ ] Prepare the n8n Creator Portal submission only after the npm package and provenance are confirmed.
- [ ] Submit through the n8n Creator Portal and record the submission separately. Do not claim verification until n8n approves it.

## Official references

- [n8n: Submit community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [n8n: Verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/)
- [npm: Trusted publishing with OIDC](https://docs.npmjs.com/trusted-publishers/)
- [npm: Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements/)
- [npm: Creating and publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/)
