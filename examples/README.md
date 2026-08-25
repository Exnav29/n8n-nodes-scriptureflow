# ScriptureFlow starter workflow patterns

These patterns are intentionally simple. They show where ScriptureFlow belongs in an n8n workflow and, just as importantly, where it does **not** belong.

ScriptureFlow should provide the attributable Scripture source. Downstream nodes may format, route, store, summarize, or discuss that source, but they should not silently replace it with model-generated text.

## 1. Daily verse delivery

```text
Schedule Trigger
      ↓
ScriptureFlow — Get Generated Verse of the Day
      ↓
Set / Edit Fields — format reference + text + version
      ↓
Email, Slack, Teams, Telegram, or another delivery node
```

### Use this for

- daily devotional reminders
- ministry team channels
- classroom or study-group prompts
- internal church communications

### Design note

Keep the reference and version in the final message. Do not strip attribution during formatting.

## 2. Grounded Bible-study assistant

```text
Form / Chat Trigger
      ↓
ScriptureFlow — Get Verse
      ↓
LLM — commentary, questions, or summary
      ↓
Merge / Format
      ↓
Reviewer or destination
```

### Use this for

- study questions
- sermon-preparation notes
- educational commentary
- discussion prompts

### Design note

Pass the API-returned Scripture to the model as source material and label model output as commentary. Never let the model fill in Scripture when the API returns an error or unavailable passage.

## 3. Ministry content pipeline

```text
Schedule / Manual Trigger
      ↓
ScriptureFlow — Get Verse or Quick Verse
      ↓
Optional AI — draft caption or reflection
      ↓
Human review
      ↓
Notion / CMS / social scheduling / database
```

### Use this for

- devotional content planning
- ministry editorial calendars
- teaching-resource preparation
- social-media drafts

### Design note

A human-review step is strongly recommended whenever AI-generated interpretation or commentary will be published publicly.

## Importable workflow files

Importable n8n workflow JSON examples are planned as a follow-on contribution. They should be generated and tested against the current node package before being committed so that examples do not become stale or misleading.

If you would like to contribute one, see [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the repository issues.
