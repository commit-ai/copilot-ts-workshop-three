## 1. Backend API Route

- [x] 1.1 Add `GET /api/superheroes/search?q=` route in `backend/src/server.ts`
- [x] 1.2 Implement plain-text fuzzy matching against superhero `name` (no regex interpretation)
- [x] 1.3 Normalize input (trim + case-fold) and handle special characters safely
- [x] 1.4 Sort results by match quality (stable tie-breaker by name then id)
- [x] 1.5 Ensure "no matches" returns `200 OK` with `[]`

## 2. Frontend Search UI

- [x] 2.1 Add a search input in `frontend/src/App.jsx` wired to the backend endpoint
- [x] 2.2 Implement debounce for the search input (avoid firing a request on every keystroke)
- [x] 2.3 On empty query, show the full heroes list (same as initial load)
- [x] 2.4 Show the message "No superheroes matching the search query" when the backend returns `[]`

## 3. Styling

- [x] 3.1 Style the search bar in `frontend/src/App.css` to match the existing app layout

## 4. Tests

- [x] 4.1 Add tests for `GET /api/superheroes/search` returning expected fuzzy matches
- [x] 4.2 Add test for "no results" returning `[]`
- [x] 4.3 Add test for special-character queries not throwing and being treated as plain text
