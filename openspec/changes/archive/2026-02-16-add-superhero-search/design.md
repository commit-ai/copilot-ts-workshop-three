## Context

The backend currently exposes `GET /api/superheroes` to return the full dataset, plus per-hero detail endpoints. The frontend fetches the full list once on load and renders a table.

This change introduces a backend fuzzy search for superhero names while preserving the existing full-list behavior.

Constraints:
- Keep the existing `GET /api/superheroes` behavior working for clients that do not search.
- Avoid introducing complex new UI flows; the core capability is an API-backed search.

## Goals / Non-Goals

**Goals:**
- Provide a backend API that supports searching superheroes by name using fuzzy matching.
- Define deterministic behavior for empty queries and for queries with no matches.
- Return results ordered by match quality.

**Non-Goals:**
- Adding new entities (teams/publishers) to the dataset.
- Implementing advanced search facets/filters beyond name search.
- Changing the superhero data model.

## Decisions

- **API shape**: Extend `GET /api/superheroes` with an optional query parameter (e.g., `?q=<string>`).
  - *Rationale*: Minimizes new routes and preserves existing clients; empty/missing `q` returns the full list.
  - *Alternative*: `GET /api/superheroes/search?q=...` (clearer separation but adds a new endpoint and duplicates routing surface).

- **Fuzzy matching approach**: Use a lightweight fuzzy string matching library (or simple scoring function) against the `name` field.
  - *Rationale*: Provides typo tolerance and match-quality ordering.
  - *Alternative*: substring/starts-with matching (simpler but not “fuzzy”).

- **Input handling**: Treat query as plain text, not a regex.
  - *Rationale*: Prevents regex injection/perf hazards and aligns with the spec requirement.

- **Ordering**: Sort by match score descending; stable tie-breaker by name then id.
  - *Rationale*: Predictable results for tests and UI.

## Risks / Trade-offs

- [Performance] Fuzzy matching across all heroes on every request → Mitigation: keep implementation simple; dataset is small; consider caching normalized names in-memory.
- [Behavior ambiguity] Exact fuzzy algorithm impacts ordering → Mitigation: codify expectations in tests using fixed inputs and validate “best match first” with representative cases.
- [API compatibility] Adding query param changes semantics for some clients that already use `q` for other purposes → Mitigation: choose a parameter name unlikely to conflict (e.g., `query`), and document it in specs/tests.
