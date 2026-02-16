## Why

Users need a fast way to find specific superheroes without scanning the entire list. Adding fuzzy search to the backend enables forgiving lookups (typos/partial names) and keeps the client simple.

## What Changes

- Add a backend search capability that returns superheroes matching a user-provided query using fuzzy name matching.
- Define a clear “no results” behavior (return an empty list; UI can show: “No superheroes matching the search query”).
- Keep existing “list all superheroes” behavior working for clients that don’t provide a query.

## Capabilities

### New Capabilities

- `superhero-search`: Search superheroes by name via the backend API using fuzzy matching, returning a list of matching heroes (possibly ranked by match quality).

### Modified Capabilities

- None.

## Impact

- Backend: add/extend an API route to support search (likely on `GET /api/superheroes` via a query parameter, or a dedicated search route).
- Frontend: optional/likely consumer of the search results (e.g., a search box filtering the heroes table) but not required for the backend capability itself.
- Tests: add coverage for fuzzy matching and “no results” behavior.