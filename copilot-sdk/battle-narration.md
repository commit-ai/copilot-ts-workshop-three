# Battle Narration (Runnable Prompt)

Use this file as a single prompt to automatically implement the “battle narration” feature end-to-end.

You are a coding agent. Make the changes directly in the repository. Do not add new features beyond what’s described here.

## Goal
Enable a Copilot SDK-powered battle narration that generates a vivid 80 to 120 word paragraph describing a fight between two selected superheroes using their names, images, and powerstats.

## Scope
Edit only these files:
- `frontend/src/App.jsx`
- `backend/src/utils/battleNarration.ts`
- `backend/src/server.ts` (only if needed to match the request/response shape and validations)

Do not create new files.

## Required behavior
- Feature shows only when `ENABLE_BATTLE_NARRATION` is `true` and exactly 2 heroes are selected.
- Frontend calls `POST /api/battle-narration` with `{ hero1, hero2 }` and displays `{ narration }`.
- Backend validates both heroes exist and have `id`, `name`, `image`, and `powerstats` with numeric fields.
- Copilot SDK integration uses the logged-in Copilot CLI user by default (no custom token helper).
- Narration is 80–120 words, includes both hero names, and declares a winner or a stalemate.
- Cleanly destroys the session and stops the client.

## 1) Frontend: enable the feature
File: `frontend/src/App.jsx`

Change the feature flag:
- Set `ENABLE_BATTLE_NARRATION = true`.

Do not alter the existing UI behavior, states, or endpoints.

## 2) Backend: implement the Copilot SDK utility
File: `backend/src/utils/battleNarration.ts`

Replace ALL `BATTLE_PLACEHOLDER` stubs with working code.

### Authentication (important)
Do NOT add a `getCopilotToken()` helper and do NOT pass `githubToken` to the client.

Instead, rely on the local Copilot CLI authentication:
- `const client = new CopilotClient();`

This should work when the developer is already logged in with the Copilot CLI.

### Copilot SDK API (must match installed SDK)
Use the `@github/copilot-sdk` API shape:
- `const client = new CopilotClient()`
- `await client.start()`
- `const session = await client.createSession({ model: "Grok Code Fast 1" })`
- Subscribe to assistant output (either `session.on("assistant.message", ...)` or `session.on((event) => ...)`)
- `await session.sendAndWait({ prompt })`
- `await session.destroy()`
- `await client.stop()` in a `finally` block

### Prompt requirements
Use the existing `buildPrompt(hero1, hero2)` helper as the basis, but strengthen it so the model:
- outputs a single narration string suitable for display (no markdown bullets, no JSON)
- is explicitly constrained to 80–120 words
- Use short paragraphs (up to 3 sentences) and insert a blank line between each paragraph
- must mention both hero names
- must end with a clear winner/tie sentence

### Return shape
Return `{ narration }` (string). Trim leading/trailing whitespace.

## 3) Backend: endpoint validation + response shape
File: `backend/src/server.ts`

Ensure `POST /api/battle-narration`:
- returns `400` with `{ error: string }` if either hero is missing or malformed
- otherwise calls `generateBattleNarration(hero1, hero2)` and returns `200` with `{ narration: result.narration }`

Do not change other endpoints.

## Acceptance checklist
- With `ENABLE_BATTLE_NARRATION = true`, the “Generate Epic Battle Story” button appears in the comparison view.
- With `ENABLE_BATTLE_NARRATION = false`, narration UI is hidden.
- Calling `POST /api/battle-narration` with valid heroes returns `{ narration }`.
- If token is invalid/missing, backend returns `500` (and logs the error) and frontend shows the retry UI.
