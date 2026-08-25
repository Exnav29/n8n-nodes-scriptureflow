# Contributing to n8n-nodes-scriptureflow

Thanks for helping improve ScriptureFlow's n8n integration.

This project welcomes focused contributions to node operations, testing, documentation, examples, and reliability. The goal is not feature count; the goal is trustworthy automation around attributable Scripture data.

## Product invariants

Every contribution must preserve these rules:

1. **Do not silently substitute translations.**
2. **Do not invent or paraphrase Scripture text.**
3. **Preserve reference and version attribution returned by the API.**
4. **Keep AI-generated commentary distinguishable from Scripture text.**
5. **Surface upstream errors instead of fabricating missing content.**

If a proposed feature conflicts with one of these rules, open an issue first and explain the use case rather than implementing around the constraint.

## Development setup

```bash
npm install
npm run lint
npm run build
npm run dev
```

Use the current Node.js/n8n versions supported by the package toolchain. `npm run dev` is the preferred path for manual node discovery and workflow testing.

## Before opening a pull request

Please:

- keep the change narrowly scoped;
- run `npm run lint`;
- run `npm run build`;
- test the affected operation manually in n8n when behavior changes;
- update documentation when inputs, outputs, or behavior change;
- add or update tests where the repository has an appropriate test path;
- avoid committing credentials, API keys, generated local artifacts, or private workflow data.

## Good contribution areas

Useful starting points include:

- importable example workflows;
- additional retrieval operations already supported by the ScriptureFlow API;
- clearer handling of partial translation coverage;
- failure-path tests;
- documentation improvements;
- accessibility and usability improvements to node fields/descriptions;
- release and provenance improvements.

Check open issues for `good first issue` and `help wanted` labels where available.

## Pull request description

A strong PR should explain:

- the problem being solved;
- what changed;
- how it was tested;
- any user-visible behavior change;
- any remaining limitation or follow-up work.

For changes involving Scripture retrieval, explicitly state how attribution and error behavior were preserved.

## AI-assisted contributions

AI-assisted development is welcome, but the contributor remains responsible for the result. Generated code, documentation, and tests should be reviewed for correctness, security, licensing, and consistency with the product invariants before submission.

## Security

Do not open a public issue containing credentials, tokens, or exploitable private-system details. For ordinary bugs that do not expose sensitive information, use GitHub Issues.
