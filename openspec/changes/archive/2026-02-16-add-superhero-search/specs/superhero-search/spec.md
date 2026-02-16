## ADDED Requirements

### Requirement: Search superheroes by query
The system SHALL provide a backend API to search the superheroes dataset by a user-provided query string and return a list of matching superheroes.

#### Scenario: Successful fuzzy search returns matching heroes
- **WHEN** a client requests superhero search with a non-empty query string
- **THEN** the system returns `200 OK` with a JSON array of superheroes whose names match the query using fuzzy matching

#### Scenario: No matching superheroes returns empty list
- **WHEN** a client requests superhero search with a non-empty query string that matches no superhero names
- **THEN** the system returns `200 OK` with an empty JSON array

#### Scenario: Empty query returns full list
- **WHEN** a client requests the superheroes list without providing a query string (or with an empty query)
- **THEN** the system returns `200 OK` with the full JSON array of superheroes

### Requirement: Search results ordering
When fuzzy search returns matches, the system SHALL order results by best match quality first.

#### Scenario: Best matches appear first
- **WHEN** a search query matches multiple superhero names with different match quality
- **THEN** the system returns the strongest matches before weaker matches

### Requirement: Input handling and safety
The system SHALL treat the query string as plain text and SHALL NOT interpret it as a regular expression.

#### Scenario: Query containing special characters does not break search
- **WHEN** a client provides a query string containing special characters (e.g., `*`, `?`, `(`, `)`, `[`, `]`)
- **THEN** the system returns `200 OK` and performs plain-text fuzzy matching without throwing an error
