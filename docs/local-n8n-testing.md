# Local n8n Testing

Your local n8n Docker sandbox runs at:

```text
http://localhost:5678
```

The ScriptureFlow community node package is deployed into the local custom nodes folder:

```text
D:\projects\n8n-local\custom-nodes\n8n-nodes-scriptureflow
```

That folder is mounted into the n8n container through the local Docker Compose setup in:

```text
D:\projects\n8n-local
```

n8n must be restarted after rebuilding or changing a custom node package.

## Deploy to Local n8n

From PowerShell:

```powershell
cd D:\projects\n8n-nodes-scriptureflow
.\scripts\deploy-to-local-n8n.ps1
```

The deploy script will:

- Run `npm.cmd run build`
- Stop if the build fails
- Replace the deployed package in `D:\projects\n8n-local\custom-nodes\n8n-nodes-scriptureflow`
- Copy `package.json` and the official `dist` build output
- Leave `node_modules` out of the local deployment
- Restart n8n with `docker compose restart` from `D:\projects\n8n-local`

After it finishes, refresh the n8n browser tab and search for `ScriptureFlow` in the node picker.

## Simple One-Node Passage Lookup

For normal passage lookup, use one `ScriptureFlow` node:

- Use `Book` > `List Books` to see which books are available in a selected version.
- Use `Passage` > `Get Verse` for one verse.
- Use `Passage` > `Get Verse Range` for a same-chapter range.
- Use `Random` > `Get Random Verse` for one random verse from a selected version.
- Pick `Version`, `Book`, `Chapter`, and `Verse` directly in the same node.

You do not need `Translation` > `List Translations` just to choose one version. That operation returns many translations and is meant for discovery and bulk workflows.

## Passage Input Modes

`Passage` > `Get Verse` retrieves a single verse. `Passage` > `Get Verse Range` retrieves a same-chapter passage range.

Both passage operations support two reference input modes.

### Guided Selection

`Guided Selection` is best for manual workflow building. It uses dropdowns for `Version`, `Book`, `Chapter`, and verse selection.

The dropdowns are dependent:

- `Version` loads from `https://scriptureflow-api-preview.pages.dev/translations.json`
- `Book` loads from `https://scriptureflow-api-preview.pages.dev/{version}/books.json`
- `Chapter` loads from `https://scriptureflow-api-preview.pages.dev/{version}/chapters.json`
- `Verse` is generated from the selected chapter's `verse_count`

The node uses n8n's supported `loadOptionsDependsOn` behavior so child dropdown options reload when parent fields change. n8n may keep an already-selected stale value visible in some cases, so after changing `Version`, `Book`, `Chapter`, or `Starting Verse`, open the dependent dropdown and reselect a valid value. Execution-time validation will stop invalid combinations with a clear message.

Do not expect guided dropdowns to reload from resolved runtime expression values such as `{{ $json.version }}`. For expression-driven workflows, use `Manual / Expression`.

### Manual / Expression

`Manual / Expression` is best for chaining from `Translation` > `List Translations`, forms, webhooks, sheets, or previous nodes. It shows normal input fields instead of dependent dropdowns, so expressions resolve at execution time.

Example expression for the `Version Name or ID` field:

```text
{{ $json.version }}
```

Use `Manual / Expression` for bulk workflows where each incoming item may have a different `version`.

By default, the node uses static verse indexes for passage lookup. The catalog JSON files are also used to keep the UI from offering invalid references like a chapter or verse that does not exist.

ScriptureFlow supports same-chapter range lookup through `end_verse` on `/api/verse`, for example:

```text
https://scriptureflow-api-preview.pages.dev/api/verse?version=en-lsv&book=amos&chapter=8&verse=4&end_verse=6
```

Passage operations support two lookup methods:

- `Static Index First`: Recommended default. Uses `https://scriptureflow-api-preview.pages.dev/{version}/verses-index.json` and split-index parts when needed. This avoids Cloudflare Worker resource limits from `/api/verse`.
- `API Endpoint`: Calls `https://scriptureflow-api-preview.pages.dev/api/verse` directly with `version`, `book`, `chapter`, `verse`, and optional `end_verse`. Use this when you specifically want to test the public API route.

If `Include Request Metadata` is enabled, static lookups include `lookupMethod` and `indexUrl`. API lookups include `lookupMethod` and `requestUrl`.

## Random Verse

`Random` > `Get Random Verse` has two random sources:

- `Fresh Random Verse`
- `Current Generated Random Verse`

`Fresh Random Verse` is randomized inside the n8n node on each execution. It loads:

```text
https://scriptureflow-api-preview.pages.dev/{version}/chapters.json
```

Then it selects across all available verses using each chapter's `verse_count` and retrieves the selected verse from the static chapter JSON path advertised by the chapter record:

```text
https://scriptureflow-api-preview.pages.dev/{version}/books/{book_slug}/chapters/{chapter}.json
```

This avoids relying on `/api/verse` for fresh random lookups. If the preview deployment returns the site HTML instead of JSON for that advertised chapter path, the node uses the static `/{version}/verses-index.json` catalog as a local-development fallback and still avoids `/api/verse`.

`Current Generated Random Verse` uses ScriptureFlow's generated file:

```text
https://scriptureflow-api-preview.pages.dev/{version}/random.json
```

That generated file may return the same verse until ScriptureFlow regenerates it.

`Passage` > `Get Verse` and `Passage` > `Get Verse Range` still use `/api/verse` for normal requested passage lookups.

This is a simple one-node operation. Example:

- `Version`: `en-kjv`

Output formats:

- `Raw JSON`
- `Plain Text`
- `Formatted Citation`

Enable `Include Request Metadata` to include the selected version and request URL in the output.

## Book List

`Book` > `List Books` retrieves books available in a selected ScriptureFlow version from:

```text
https://scriptureflow-api-preview.pages.dev/{version}/books.json
```

This helps you see which books are available in a translation before building passage lookups. Some translations are partial and may have fewer books, chapters, or verses than others.

It supports:

- `Simplified List`
- `Raw JSON`
- `One Item Per Book`
- `Single Item With List`
- `Include Summary`

Use `One Item Per Book` when chaining into later nodes. Use `Single Item With List` when you want one review or summary item with a `books` array. In list mode, `Include Summary` adds the selected version plus total book, chapter, and verse counts.

`Book` > `List Chapters` retrieves chapters available in a selected ScriptureFlow version from:

```text
https://scriptureflow-api-preview.pages.dev/{version}/chapters.json
```

It can return all chapters for the version, or only chapters for one selected book. This is useful for validating references, creating reading plans, and building dynamic Scripture workflows. Some translations are partial and may have fewer chapters.

It supports:

- `Simplified List`
- `Raw JSON`
- `One Item Per Chapter`
- `Single Item With List`
- `Include Summary`
- `Maximum Results`

Use `One Item Per Chapter` when chaining. Use `Single Item With List` when you want one review or summary item with a `chapters` array. `Maximum Results` is useful during testing, especially when returning all chapters for a full translation.

## Translation List

`Translation` > `List Translations` retrieves available ScriptureFlow translations from:

```text
https://scriptureflow-api-preview.pages.dev/translations.json
```

This operation returns many translations by default. If connected directly to another node, downstream nodes execute once per returned translation item. Use it for discovery, comparison, audits, and intentional bulk workflows. Do not use it just to choose one version for a normal passage lookup; use `Passage` > `Get Verse` or `Passage` > `Get Verse Range` directly.

It can return `Raw JSON` or a `Simplified List`. It also supports:

- `Return Mode`
- `Status Filter`
- `Language Code Filter`, for example `en`
- `Maximum Results`
- `Include Summary`

Use `Maximum Results` to limit output during testing.

For chaining into `Passage` > `Get Verse`, use `Return Mode` = `One Item Per Translation`. Then set `Passage` > `Reference Input Mode` to `Manual / Expression` and set the Passage `Version Name or ID` field with:

```text
{{ $json.version }}
```

Use `version` as the ScriptureFlow version ID. Do not use `translation_name` as the version ID.

For normal item-by-item chaining, do not use array-index expressions like:

```text
{{ $json[12].version }}
```

Each incoming item already has its own `version`, so `{{ $json.version }}` is the correct expression.

Some translations are partial and may not contain the selected book, chapter, verse, or range. For normal bulk ScriptureFlow workflows, leave n8n's built-in `Continue On Fail` setting turned off and use ScriptureFlow's own `Unavailable Passage Behavior` option instead.

Set `Passage` > `Options` > `Unavailable Passage Behavior` to `Return Error Item` so expected unavailable passages produce normal output items with `ok: false` instead of stopping the workflow. The default remains `Error`.

Unavailable passages return:

```json
{
  "ok": false,
  "errorType": "unavailable_passage"
}
```

API or request failures return:

```json
{
  "ok": false,
  "errorType": "api_request_failed"
}
```

Those error items include the selected `version`, `book`, `chapter`, `verse`, optional `end_verse`, and `requestUrl` when available. API/request failures also include `statusCode`, `statusText`, and a small `responseBody` when ScriptureFlow or the HTTP client provides them.

If you turn on n8n's built-in `Continue On Fail`, n8n may show the warning "execution will continue even if the node fails." That warning comes from n8n, not ScriptureFlow. It is not required for normal ScriptureFlow bulk workflows.

Example bulk setup:

- `Translation` > `List Translations`
- `Return Mode`: `One Item Per Translation`
- `Language Code Filter`: `en`
- Then `Passage` > `Get Verse`
- `Reference Input Mode`: `Manual / Expression`
- `Version Name or ID`: `{{ $json.version }}`
- `Book Name or ID`: `1-peter`
- `Chapter`: `4`
- `Verse`: `1`
- `Unavailable Passage Behavior`: `Return Error Item`

Expected bulk behavior:

- The workflow should not require n8n's built-in `Continue On Fail` setting.
- Valid translations return Scripture data.
- Partial translations return `ok: false` with `errorType: unavailable_passage`.
- API/request failures return `ok: false` with `errorType: api_request_failed`.
- Output should not contain generic-only error items such as `{ "error": "ScriptureFlow API request failed" }`.

`Include Summary` applies to `Return Mode` = `Single Item With List`. In item mode, summary is intentionally omitted so each output item stays easy to chain.

The node intentionally does not use `/api/translations` because that route currently returns the preview site HTML instead of the translation catalog JSON.

## Local v0.1.0 Test Checklist

Use this checklist after deploying a new local build:

- `Passage` > `Get Verse`: `Guided Selection`, `en-kjv`, `John`, chapter `3`, verse `16`, `Lookup Method` = `Static Index First`, `Raw JSON`.
- `Passage` > `Get Verse Range`: `Guided Selection`, `en-kjv`, `John`, chapter `3`, starting verse `16`, ending verse `18`, `Lookup Method` = `Static Index First`, `Formatted Citation`.
- `Translation` > `List Translations`: `One Item Per Translation`, `Simplified List`, `Status Filter` = `Ready`, `Language Code Filter` = `en`, `Maximum Results` = `5`.
- `Book` > `List Books`: `en-kjv`, `Simplified List`, `One Item Per Book`.
- `Book` > `List Chapters`: `en-kjv`, `Ruth`, `Simplified List`, `One Item Per Chapter`; expected result is 4 chapters.
- `Random` > `Get Random Verse`: `Fresh Random Verse`, `en-kjv`, `Formatted Citation`; repeated runs should be able to return different references.
- `Random` > `Get Random Verse`: `Current Generated Random Verse`, `en-kjv`, `Raw JSON`; repeated runs may return the same generated verse.
- Bulk translation workflow: `Translation` > `List Translations` into `Passage` > `Get Verse`, `Manual / Expression`, `Version Name or ID` = `{{ $json.version }}`, `Unavailable Passage Behavior` = `Return Error Item`.

## Known Issues / Revisit Before Publishing

- Confirm public static chapter JSON paths. Fresh Random currently may fall back to `/{version}/verses-index.json` because preview chapter paths returned HTML during local testing.
- Watch `/api/verse` Worker limits. Passage defaults to Static Index First because `/api/verse` can return Cloudflare 1102 resource-limit errors.
- Review Fresh Random behavior for split-index translations.
- Refine Manual / Expression error wording where it still sounds like Guided Selection.
- Review output consistency before npm release.
- Add example workflow JSON before public release.
- Add GitHub Actions and npm provenance before n8n verification.
- Confirm licensing and publication notes before public package promotion.

## Troubleshooting

If the node does not appear:

1. Confirm n8n is running at `http://localhost:5678`.
2. Confirm the deploy script completed without errors.
3. Check that files exist in `D:\projects\n8n-local\custom-nodes\n8n-nodes-scriptureflow`.
4. Restart n8n again from the sandbox folder:

```powershell
cd D:\projects\n8n-local
docker compose restart
```

5. Check n8n logs:

```powershell
cd D:\projects\n8n-local
docker compose logs -f n8n
```

6. Refresh the browser tab and search for `ScriptureFlow` again.

If n8n logs mention missing dependencies, we can revisit whether this local deployment needs a minimal dependency install in the deployed package folder. For now, the script intentionally avoids copying `node_modules` to keep the local package clean.
