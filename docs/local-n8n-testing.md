# Local n8n Testing

Use a local or disposable n8n environment only. Do not test this unpublished package in production workflows.

The repository's local Docker sandbox, when available, runs at `http://localhost:5678` and mounts the custom package from:

```text
D:\projects\n8n-local-dev\custom-nodes\ScriptureFlow
```

Deploy a fresh build with:

```powershell
cd D:\projects\n8n-nodes-scriptureflow
.\scripts\deploy-to-local-n8n.ps1
```

The script builds the package, copies the compiled `dist/nodes/ScriptureFlow` extension into the mounted custom-extension tree, and restarts the local n8n container. Refresh n8n and search for `ScriptureFlow` in the node picker.

## V1 smoke-test workflow

Create a new local test workflow. Do not modify an existing production workflow.

1. **Translation > Get Many**
   - Leave Simplify off to confirm raw catalog entries.
   - Confirm statuses are not silently filtered.
2. **Book > Get Many**
   - Version Key: `en-kjv`
   - Confirm raw book entries are returned and partial coverage metadata remains visible.
3. **Scripture > Get Verse**
   - Version Key: `en-kjv`
   - Book: `John`
   - Chapter: `3`
   - Verse: `16`
   - Confirm the response includes ScriptureFlow reference/version attribution and API-provided text.
4. **Scripture > Get Quick Verse**
   - Version Key: `en-kjv`
   - Confirm the response is attributed and understand that request-time selection may differ between executions.
5. **Scripture > Get Generated Verse of the Day**
   - Version Key: `en-kjv`
   - Confirm the generated static resource is returned separately from Quick Verse.

Repeat the Scripture operations with Simplify enabled and confirm useful attribution fields remain. Also test an invalid Version Key and invalid verse; errors should explain what to correct and direct users to `https://scriptureflow-api-preview.pages.dev/translations.json` where relevant.

## V1 behavior

- Public preview requires no credentials.
- Version Key, Book, Chapter, and Verse are explicit fields; there are no network-dependent guided dropdowns.
- Get Verse calls `/api/verse` directly.
- Quick Verse calls `/api/quick-verse` directly.
- Generated Verse of the Day calls `/{version}/random.json` directly.
- Raw ScriptureFlow JSON is the default.
- The node has no static verse-index traversal, split-index traversal, client-side random selection, passage ranges, formatted output, request wrappers, or custom error-item option.
- n8n's built-in Continue On Fail behavior remains available.

## Troubleshooting

If the node does not appear:

1. Confirm n8n is running at `http://localhost:5678`.
2. Confirm the deployment script completed successfully.
3. Confirm the mounted custom-extension folder includes `ScriptureFlow/Scriptureflow.node.js`.
4. Restart the local n8n container from `D:\projects\n8n-local-dev`.
5. Check the container logs, then refresh the browser and search again.

Local panel confirmation, npm development-tool audit findings, provenance publishing, npm publication, and Creator Portal submission remain release gates until explicitly completed.
