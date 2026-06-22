# ScriptureFlow n8n Node Release Checklist

This checklist prepares a controlled npm release of `n8n-nodes-scriptureflow`. The package is currently unpublished, has not been submitted to the n8n Creator Portal, and is not verified by n8n.

The verified-submission path must publish from the GitHub Actions workflow in `.github/workflows/publish.yml` with npm provenance. Do not use a local `npm publish` for that path.

## Before publishing

### npm account and package readiness

- [ ] Confirm the publishing npm account is active, has a verified email address, uses two-factor authentication, and is authorized to publish the package.
- [ ] Confirm the package name remains `n8n-nodes-scriptureflow` and check its current registry status with `npm view n8n-nodes-scriptureflow`.
- [ ] Confirm the version in `package.json` is the intended release version and does not already exist in npm.
- [ ] Confirm the public repository URL in `package.json` is exactly `https://github.com/Exnav29/n8n-nodes-scriptureflow.git`.
- [ ] Confirm the package is MIT licensed, has no runtime dependencies, includes `n8n-community-node-package`, and documents the supported operations.
- [ ] Review the outstanding npm audit findings in development tooling and decide whether release-blocking remediation is needed.

### npm trusted publisher configuration

- [ ] In the npm package settings, add a GitHub Actions trusted publisher with:
  - Organization or user: `Exnav29`
  - Repository: `n8n-nodes-scriptureflow`
  - Workflow filename: `publish.yml`
  - Allowed action: `npm publish`
- [ ] Do not enter `.github/workflows/publish.yml` in npm's workflow field; npm expects the filename only.
- [ ] Confirm the trusted publisher configuration is active before pushing a release tag.
- [ ] Confirm the workflow uses a GitHub-hosted runner and has `id-token: write` and `contents: read` permissions.
- [ ] Confirm the release runner provides Node.js 24 and npm 11.5.1 or later.

Trusted publishing remains the preferred release path. Because the package is currently unpublished, npm package settings may not be available until the first version creates the registry record. If so, use the workflow's token bootstrap for the first publish only:

- [ ] Create a short-lived, narrowly scoped npm automation/granular access token authorized only for the first package publish.
- [ ] Store the token only as the GitHub Actions repository secret `NPM_TOKEN`; never commit or print its value.
- [ ] After the first successful publish, revoke the npm token immediately and remove the `NPM_TOKEN` repository secret.
- [ ] Configure the GitHub Actions trusted publisher in the new npm package settings before any later release.

The workflow maps `NPM_TOKEN` to npm's `NODE_AUTH_TOKEN` environment variable. Once trusted publishing is configured, npm uses OIDC for authentication; the temporary secret should no longer exist. Do not publish locally.

### Final validation

- [ ] Pull the intended release commit and verify the worktree is clean.
- [ ] Run `npm ci`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm pack --dry-run --ignore-scripts` and inspect every packaged file.
- [ ] Confirm the five v1 actions and custom icon still pass local n8n verification.
- [ ] Confirm there are no secrets, tokens, private URLs, credentials, runtime dependencies, or unexpected generated files.
- [ ] Confirm the package version and release tag will match, for example package version `0.1.0` and tag `v0.1.0`.

## Publish

- [ ] Merge all approved release-preparation changes to `main`.
- [ ] Create an annotated release tag from the exact approved `main` commit, for example `git tag -a v0.1.0 -m "Release v0.1.0"`.
- [ ] Recheck the tag target before pushing it.
- [ ] Push only the intended tag, for example `git push origin v0.1.0`.
- [ ] Watch the **Publish to npm with provenance** GitHub Actions run.
- [ ] Confirm dependency installation, lint, build, and package preview pass before the publish step.
- [ ] Confirm `npm publish --provenance --access public` succeeds through the approved first-publish token bootstrap or, after the package exists, trusted publishing/OIDC.

Pushing a matching `v*.*.*` tag is the action that starts the publish workflow. Normal branches, pull requests, and ordinary pushes do not trigger it.

## After publishing

- [ ] Open the npm package page and confirm the expected version, README, MIT license, repository link, keywords, files, and provenance attestation.
- [ ] For the first publish, revoke the temporary npm token immediately and remove the `NPM_TOKEN` GitHub Actions secret.
- [ ] Configure and confirm npm trusted publishing for all future releases.
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
