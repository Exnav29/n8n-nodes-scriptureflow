# Verification Submission Readiness

This repository is prepared for n8n Creator Portal submission review, but it has not been approved or verified by n8n.

## Package status

- Package: `n8n-nodes-scriptureflow@0.1.0`
- Public repository: `https://github.com/Exnav29/n8n-nodes-scriptureflow.git`
- License: MIT
- Runtime dependencies: none
- Credentials: none required during the ScriptureFlow public preview
- Publication: GitHub Actions provenance publishing through `.github/workflows/publish.yml`

## Verification checks

- Community package scanner: passed for `n8n-nodes-scriptureflow@0.1.0`
- Clean n8n install: passed
- Five-operation smoke test: passed

The scanner run emitted a Node `DEP0190` deprecation warning during execution. This is non-blocking for submission readiness because the scanner still reported that `n8n-nodes-scriptureflow@0.1.0` passed all security checks.

## Smoke-tested operations

The five-operation smoke test covered the full v1 surface:

1. **Translation > Get Many**
2. **Book > Get Many**
3. **Scripture > Get Verse**
4. **Scripture > Get Quick Verse**
5. **Scripture > Get Generated Verse of the Day**

The package remains in public preview and must still be submitted through the n8n Creator Portal for n8n review.
