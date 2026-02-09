# Battle Narration (Runnable Prompt)

Use this file as the basis for implementing the “battle narration” feature end-to-end.
Make the changes directly in the repository.

## Goal
Enable a battle narration that generates a vivid 80 to 120 word paragraph describing a fight between two selected superheroes using their names, images, and powerstats.

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
- Narration is 80–120 words, includes both hero names, and declares a winner or a stalemate.

## 1) Frontend: enable the feature
File: `frontend/src/App.jsx`

Change the feature flag:
- Set `ENABLE_BATTLE_NARRATION = true`.

Do not alter the existing UI behavior, states, or endpoints.

## 2) Backend: implement the battle narration utility
File: `backend/src/utils/battleNarration.ts`
Replace ALL `BATTLE_PLACEHOLDER` stubs with working code.

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
- If input is invalid/missing, backend returns `400` (and logs the error) and frontend shows the retry UI.
- If there is an error during narration generation or processing, backend returns `500` and frontend shows the retry UI.
