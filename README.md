# n8n-nodes-scriptureflow

This is an early local-development scaffold for an n8n community node that connects n8n workflows to the ScriptureFlow API.

## Local n8n Testing

For local Docker-based testing, deploy this package into the n8n sandbox at `D:\projects\n8n-local`. See `docs\local-n8n-testing.md`.

```powershell
cd D:\projects\n8n-nodes-scriptureflow
.\scripts\deploy-to-local-n8n.ps1
```

## Simple One-Node Usage

For a normal passage lookup, use one `ScriptureFlow` node:

- `Book` > `List Books` shows the books available in a selected version.
- `Passage` > `Get Verse` retrieves one verse.
- `Passage` > `Get Verse Range` retrieves a same-chapter range.
- `Random` > `Get Random Verse` retrieves one random verse from a selected version.
- Use `Guided Selection` to pick Version, Book, Chapter, and Verse directly in the node.

You do not need `Translation` > `List Translations` just to choose one version.

`Passage` > `Get Verse` and `Passage` > `Get Verse Range` default to `Lookup Method` = `Static Index First`. This uses `/{version}/verses-index.json` and split-index parts when needed, avoiding Cloudflare Worker resource limits from the public `/api/verse` endpoint. `Lookup Method` = `API Endpoint` remains available when you specifically want to test the public API route.

`Random` > `Get Random Verse` supports a fresh mode that selects a random verse inside the n8n node using `/{version}/chapters.json` and retrieves the selected verse from static ScriptureFlow JSON instead of `/api/verse`. It also supports a generated mode that reads ScriptureFlow's `/{version}/random.json` file, which may repeat until ScriptureFlow regenerates it.

In the current preview deployment, advertised static chapter paths may return the preview HTML instead of JSON. The node handles that for local development by falling back to the static `/{version}/verses-index.json` catalog while still avoiding `/api/verse` for fresh random lookups.

## Advanced Bulk Usage

Use `Translation` > `List Translations` when you intentionally want many translations for discovery, comparison, audits, or bulk workflows. Downstream nodes execute once per returned item.

For item-by-item workflows:

- Set `Return Mode` to `One Item Per Translation`.
- Use `Maximum Results` to limit output during testing.
- In a later Passage node, set `Reference Input Mode` to `Manual / Expression`.
- Use `{{ $json.version }}` as the Passage version value.

Do not use `translation_name` as the version ID.

## Book Catalog

`Book` > `List Books` uses `/{version}/books.json` to list books available in a selected ScriptureFlow version. Some translations are partial, so this is useful for checking whether a translation has the book coverage you expect.

Use `Return Mode` = `One Item Per Book` for chaining, or `Single Item With List` with `Include Summary` for review output.

`Book` > `List Chapters` uses `/{version}/chapters.json` to list all chapters in a selected version, or only chapters for one selected book. It is useful for validating references, creating reading plans, and building dynamic Scripture workflows.

Use `Return Mode` = `One Item Per Chapter` for chaining, or `Single Item With List` with `Include Summary` for review output. Use `Maximum Results` to limit chapter output during testing.

## Known Issues / Revisit Before Publishing

- Confirm public static chapter JSON paths. Fresh Random currently may fall back to `/{version}/verses-index.json` because preview chapter paths returned HTML during local testing.
- Watch `/api/verse` Worker limits. Passage defaults to Static Index First because `/api/verse` can return Cloudflare 1102 resource-limit errors.
- Review Fresh Random behavior for split-index translations.
- Refine Manual / Expression error wording where it still sounds like Guided Selection.
- Review output consistency before npm release.
- Add example workflow JSON before public release.
- Add GitHub Actions and npm provenance before n8n verification.
- Confirm licensing and publication notes before public package promotion.

## Credentials

No credentials are required for the current public ScriptureFlow preview API.
