# ScriptureFlow n8n Node v1 Scope Audit

## Audit purpose and sources

This audit inventories the exploratory node on `main` and recommends a smaller release target before any new operations are added. It reviews:

- `nodes/Scriptureflow/Scriptureflow.node.ts`
- `nodes/Scriptureflow/Scriptureflow.node.json`
- `nodes/Scriptureflow/resources/*`
- `package.json`
- `README.md`
- `docs/scriptureflow-node-roadmap.md`
- `docs/publishing-readiness.md`

UX findings are checked against the current [n8n UX guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/) and [community-node verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/).

This PR does not implement, remove, or rename operations. Recommendations below are release gates for follow-up work.

## 1. Current implemented surface

The node is programmatic and exposes four resources with six operation values. It has no credentials and uses the fixed public-preview base URL `https://scriptureflow-api-preview.pages.dev`.

| Resource | UI operation | Value | Endpoint/data source | Inputs | Output behavior | v1 safety |
|---|---|---|---|---|---|---|
| Translation | List Translations | `listTranslations` | `GET /translations.json` | Status filter, language-code filter, maximum results, output format, return mode, include summary | Raw or simplified translation entries; one item per translation or one list; optional summary | **Keep after UX cleanup.** The request is simple and public-preview safe. Rename toward n8n's Get Many convention, standardize Simplify, and review unlimited output. |
| Book | List Books | `listBooks` | `GET /{version}/books.json` | Version; output format, return mode, include summary | Raw or simplified book entries; one item per book or one list; optional aggregate counts | **Keep after UX cleanup.** It is a useful coverage check for partial translations and uses one static catalog request. |
| Book | List Chapters | `listChapters` | `GET /{version}/chapters.json` | Version, optional book; output format, return mode, include summary, maximum results | Raw or simplified chapter entries; one item per chapter or one list; optional summary | **Defer.** It expands v1 UI/output scope and can return a large catalog. It is useful later but not required for basic retrieval. |
| Passage | Get Verse | `getVerse` | Always validates against `/{version}/chapters.json`; then either `GET /api/verse` or static `/{version}/verses-index.json` plus split part files | Guided or manual version/book/chapter/verse; lookup method; output format; request metadata; unavailable behavior | Raw JSON, plain text, or formatted citation; optional request wrapper; custom error item option | **Keep only after narrowing.** Use the public `/api/verse` path for v1, remove static traversal and excess modes, and preserve API output by default. |
| Passage | Get Verse Range | `getVerseRange` | Always validates against `/{version}/chapters.json`; then either `GET /api/verse` with `end_verse` or static verse-index traversal | Guided or manual version/book/chapter/start/end verse; lookup method; output format; request metadata; unavailable behavior | Raw JSON, plain text, or formatted citation; same-chapter validation; custom error item option | **Defer.** The API supports same-chapter ranges, but the current guided fields, static traversal, formatting, and custom error modes make the v1 surface larger than necessary. |
| Random | Get Random Verse | `getRandomVerse` | Generated mode: `GET /{version}/random.json`. Fresh mode: `/{version}/chapters.json`, then a static chapter path, with fallback to `/{version}/verses-index.json` | Version; random source; output format; request metadata | Raw JSON, plain text, or formatted citation; fresh mode creates a synthetic response and records lookup metadata | **Do not release as currently designed.** Split into direct Quick Verse and generated Verse of the Day operations; defer custom fresh-static selection. |

### Current load-options requests

Guided inputs also make UI-time requests to:

- `/translations.json` for versions (currently filtered to `status === "ready"`);
- `/{version}/books.json` for books;
- `/{version}/chapters.json` for chapters and verse counts.

Version, book, chapter, verse, and ending-verse dropdowns are chained. This is convenient in a successful manual session but creates multiple network-dependent UI states and stale-selection hints.

### Current transformations

- Raw mode returns the API/static response directly unless request metadata is enabled, in which case it wraps the response in `{ request, data }`.
- Translation, book, and chapter operations have custom raw/simplified formats and item/list modes.
- Passage and random operations have Raw JSON, Plain Text, and Formatted Citation modes.
- Plain Text can return only `{ text }`, dropping separate reference/version fields unless request metadata is enabled.
- Formatted Citation creates a new string containing a derived reference, version, and API-provided text.
- Static passage and fresh-random paths synthesize response objects instead of returning the public runtime endpoint shape.

The code does not contain fallback Scripture text, but several modes transform or reduce attribution fields enough to be a release concern.

## 2. Recommended v1 scope

Target the smallest stable set that demonstrates discovery and Scripture retrieval without maintaining a second client-side data layer.

### Recommended v1 release target

1. **Translation — Get Many** (current `List Translations`)
   - Call `/translations.json` once.
   - Return raw entries by default or use the standard `Simplify` boolean.
   - Include a conventional Return All/Limit decision if n8n guidance requires it.
2. **Book — Get Many** (current `List Books`)
   - Call `/{version}/books.json` once.
   - Make partial-translation coverage visible.
   - Use raw response entries by default with optional standard Simplify behavior.
3. **Scripture — Get Verse** (narrowed current `Passage > Get Verse`)
   - Call `/api/verse` directly with structured version/book/chapter/verse inputs.
   - Do not pre-traverse chapter or verse indexes in v1.
   - Preserve the ScriptureFlow API response by default.
4. **Scripture — Get Quick Verse**
   - Call `/api/quick-verse` directly.
   - Explain that selection occurs at request time and may differ between executions.
   - This operation is on the roadmap but is **not currently implemented**.
5. **Scripture — Get Generated Verse of the Day** (optional v1)
   - Keep only the simple `/{version}/random.json` request.
   - Name and describe it distinctly from Quick Verse.

### Defer from v1

- List Chapters.
- Get Verse Range/Get Passage.
- Free-text Lookup Reference, unless chosen instead of structured Get Verse rather than added alongside it.
- Static verse-index traversal for passage lookup.
- Split-index part traversal inside the node.
- Fresh random selection from chapter catalogs/static indexes.
- Multi-level guided version/book/chapter/verse dropdowns if they remain brittle in local UI testing.
- Plain Text and Formatted Citation output modes.
- Custom request metadata wrappers and custom Return Error Item behavior.
- Additional catalog/metadata operations in the roadmap.

The API should remain the source of truth. v1 should prove a clean n8n UX over stable public endpoints before adding catalog depth or client-side fallback logic.

## 3. Keep / defer / remove table

| Current operation | Keep for v1? | Reason | Required change before release |
|---|---|---|---|
| Translation > List Translations | Yes | Simple, useful discovery request | Rename to n8n-style Get Many/List translations copy; standardize Simplify; review Return All/Limit and status filtering. |
| Book > List Books | Yes | Simple coverage discovery for partial translations | Standardize Simplify/raw behavior; clarify Version Key; review item/list options. |
| Book > List Chapters | No — defer | Useful but not needed for core retrieval; can return large output | Revisit after v1 with conventional Get Many pagination/limit UX. |
| Passage > Get Verse | Yes, after narrowing | Core Scripture operation | Make `/api/verse` the only v1 lookup path; remove index traversal, extra format modes, and duplicate error behavior. |
| Passage > Get Verse Range | No — defer | Same-chapter behavior is valid but current implementation adds many inputs and paths | Reintroduce as Get Passage after core Get Verse is stable and manually tested. |
| Random > Get Random Verse — Fresh | Remove from v1 | Multi-request static selection is fragile and duplicates server responsibility | Replace later with direct `/api/quick-verse`; do not preserve fresh static fallback. |
| Random > Get Random Verse — Generated | Keep only as separate optional operation | `/{version}/random.json` is a simple stable request | Rename to Get Generated Verse of the Day and separate it from Quick Verse. |

## 4. n8n UX review

### Names and resources

- `ScriptureFlow` display casing is correct.
- `Translation`, `Book`, and `Passage` are understandable, but `Passage` contains single-verse behavior and `Random` hides two semantically different products.
- Prefer `Translation`, `Book`, and `Scripture` resources for the narrowed release.
- n8n commonly uses `Get Many` for list operations. Keep ScriptureFlow-specific descriptions, but consider `Get Many` names/actions for Translation and Book.
- `Get Verse Range` should become `Get Passage` if reintroduced.
- `Get Random Verse` must not combine Quick Verse and generated Verse of the Day.

### Parameters and placeholders

- Display labels generally use Title Case and descriptions/actions generally use sentence case.
- `Version Name or ID` is scaffold-style copy but ScriptureFlow's public term is **Version Key**.
- `Book Name or ID` can be simplified to **Book**.
- Manual fields use defaults as examples but do not use n8n's recommended `e.g.` placeholders.
- Suggested placeholders: `e.g. en-kjv`, `e.g. John 3:16`, and `e.g. Amos`.
- Guided inputs depend on several load-options calls. A v1 manual/expression path with clear placeholders is lower risk; guided selection can return after local reliability testing.

### Output UX

- Custom `Output Format` options do not follow the normal-node `Simplify` boolean guidance for responses over 10 fields.
- Raw mode is safest, but enabling request metadata changes its shape by wrapping it.
- Plain Text drops explicit reference/version attribution.
- Formatted Citation preserves attribution only inside one constructed string and is harder for downstream nodes to map.
- Prefer raw API JSON by default. If needed, add `Simplify` with n8n's standard description and retain no more than the most useful fields.
- List operations can create many n8n items. Return All/Limit behavior should follow n8n conventions rather than custom `Maximum Results: 0` semantics.
- `usableAsTool: true` increases the importance of compact, predictable output. Recheck AI-tool output guidance before verification.

### Errors

- The implementation uses `NodeApiError` and `NodeOperationError` and generally includes actionable context.
- `Unavailable Passage Behavior: Return Error Item` overlaps with n8n's standard Continue On Fail behavior and complicates the operation.
- Some errors expose static-index implementation details and long internal request paths rather than only explaining recovery.
- API JSON with `ok: false` should be handled explicitly even when HTTP status is successful.
- Errors involving versions should direct users to `/translations.json`.
- Public preview correctly requires no credentials.

## 5. ScriptureFlow API alignment

### Response preservation

- API-mode raw passage output preserves the response when request metadata is disabled.
- Translation/book/chapter item modes intentionally return entries rather than an original response envelope.
- Static passage and fresh-random modes synthesize `ok`, `query`, `reference`, `result`, and `lookup` objects. They do not preserve the exact runtime API response shape.
- Request metadata wraps raw output and therefore changes the top-level shape.

**Recommendation:** v1 Scripture operations should return runtime endpoint JSON unchanged by default.

### Scripture text integrity

- No hardcoded fallback Scripture text was found.
- Verse text is taken from API/static responses.
- Passage ranges join returned verse text with newline separators for non-raw formats.
- Formatted Citation constructs presentation text around API-provided Scripture. It does not paraphrase, but it should be deferred so text and attribution remain separately addressable.

### Translation and coverage behavior

- Execution does not silently swap versions.
- Guided load-options helpers use fallback defaults such as `en-kjv`, `john`, and chapter 3 while populating controls; this can mask missing/stale UI state and needs review.
- The version dropdown currently includes only translations with `status: ready`, while List Translations can expose other statuses. Document this difference if guided controls remain.
- Chapter validation surfaces missing chapter/verse coverage and therefore helps expose partial translations.
- Book listing is the simplest way to let users inspect partial coverage.

### Endpoint semantics

- Quick Verse and generated Verse of the Day are not currently distinguished because Quick Verse is absent.
- Generated mode correctly calls `/{version}/random.json`.
- Fresh mode is a node-side random algorithm, not `/api/quick-verse`.
- Passage ranges enforce same-chapter start/end bounds.
- API passage mode still depends on `/{version}/chapters.json` validation before calling `/api/verse`, so it is not a single-endpoint path.

### Static-data risk

- Static passage mode loads a full verse array or every referenced split-index part into memory until a match/range is found.
- Split-index traversal can produce many sequential network requests and ties node correctness to manifest details.
- Fresh random fallback only accepts a single-array verse index and rejects split-index manifests.
- Static chapter paths may return non-JSON preview content, which is already recorded in exploratory testing notes.

**Recommendation:** defer all static verse/chapter traversal from v1 and rely on the public runtime endpoints for Scripture operations.

## 6. Technical risk review

| Area | Finding | Risk/recommendation |
|---|---|---|
| Runtime dependencies | No `dependencies` entries; `n8n-workflow` is a peer dependency | Good for verification. Keep runtime dependencies at zero. |
| Development dependencies | n8n-node CLI, ESLint, Prettier, release-it, and TypeScript only at the package root | Foundation is appropriate, but npm audit reported transitive dev-tool findings; review before release. |
| Package identity | `n8n-nodes-scriptureflow`, MIT, and `n8n-community-node-package` are present | Meets identity baseline. |
| Repository metadata | Points to the public `Exnav29/n8n-nodes-scriptureflow` repository | Appropriate for future npm provenance. |
| n8n manifest | Registers `dist/nodes/Scriptureflow/Scriptureflow.node.js`; credentials are empty | Valid current build path. Recheck after any folder rename. |
| Publishing workflow | No npm publishing workflow exists; package-readiness workflow only validates | Safe now. Add provenance publishing separately after release gates pass. |
| Secrets/credentials | No credential class, API key, token, or committed secret is required | Good for public preview. Maintain scans. |
| Base URL | Hardcoded to public preview | Acceptable for v1 preview, but no custom test URL. Do not add credentials merely to configure it. |
| Programmatic complexity | One file contains catalog loading, dynamic options, split-index traversal, random selection, formatting, and execution | High maintenance risk. Narrowing operations may allow smaller helpers or declarative requests later. |
| Folder casing | Source folder/class files use `Scriptureflow`; product display uses `ScriptureFlow` | Rename to `ScriptureFlow` before release for consistency. Do it in one case-safe change and update `package.json` n8n paths; verify on Linux/CI. |
| Node metadata categories | `Development` and `Developer Tools` are inherited/current | Review against n8n category expectations before submission; ScriptureFlow is primarily a data integration. |

## 7. Release blockers

- The node has not yet been manually confirmed in the local n8n nodes panel at `localhost:5678`. During this audit, `npm run dev` reached a zero-error TypeScript watch build but did not finish its first-run disposable n8n installation within the smoke-test window, so no panel claim is made.
- The community package scanner resolves npm packages and is not useful until an npm package exists; no package is published yet.
- Exploratory operations need narrowing and cleanup according to this audit.
- Direct Quick Verse is not implemented, while custom fresh-random logic is over-complex.
- Static passage/split-index traversal and guided load-options behavior require removal or deeper testing.
- Output modes do not yet follow standard Simplify/raw guidance consistently.
- Folder casing should be normalized before release.
- A GitHub Actions provenance publishing workflow is intentionally deferred.
- npm trusted publishing/package ownership is not configured.
- Creator Portal submission is intentionally deferred.
- Transitive development-tool audit findings must be reviewed before release.
- README operation documentation must be updated after the v1 surface is finalized.

## 8. Recommended next PR

### Recommended title

**Narrow ScriptureFlow node to v1 core operations**

### Recommended scope

- Keep and standardize Translation Get Many and Book Get Many.
- Keep Get Verse but make it API-only and raw-by-default.
- Remove/defer List Chapters, Get Verse Range, static passage traversal, split-index traversal, fresh random selection, guided dropdown chains, custom format modes, and custom error-item behavior.
- Replace the ambiguous Random operation with direct Quick Verse and, if retained, a separate generated Verse of the Day operation.
- Standardize Version Key labels, `e.g.` placeholders, Simplify behavior, and actionable errors.
- Normalize `Scriptureflow` folder/file casing to `ScriptureFlow` in a case-safe commit.
- Add focused tests or fixtures for the retained core operations.
- Update README only after the implemented surface matches the narrowed scope.

That PR should remain pre-publication: lint, build, local n8n panel testing, and dry-run package inspection only. Provenance publishing and Creator Portal submission should remain separate later phases.
