# Superhero MCP Server

This MCP (Model Context Protocol) server provides tools for interacting with superhero data, making the application "agent ready via MCP".

## Available Tools

### 1. get_superhero

Get detailed information about a specific superhero by name or ID.

**Parameters:**
- `name` (optional): Name of the superhero (case-insensitive)
- `id` (optional): ID of the superhero

**Example Usage:**
```
Tool: get_superhero
Parameters: { "name": "A-Bomb" }
```

**Response:**
Returns detailed superhero information including name, image, and all powerstats (intelligence, strength, speed, durability, power, combat).

---

### 2. list-superheros

List all available superheroes with their IDs and names.

**Parameters:** None

**Example Usage:**
```
Tool: list-superheros
Parameters: {}
```

**Response:**
Returns a formatted list of all superheroes with their IDs and names, plus the total count.

---

### 3. compare-suoerheros

Compare two superheroes side-by-side across all powerstats to determine winners in each category.

**Parameters:**
- `hero1` (required): Name or ID of the first superhero
- `hero2` (required): Name or ID of the second superhero

**Example Usage:**
```
Tool: compare-suoerheros
Parameters: { "hero1": "A-Bomb", "hero2": "Abomination" }
```

**Response:**
Returns a detailed comparison showing:
- Winner for each powerstat category (intelligence, strength, speed, durability, power, combat)
- Total stats for each hero
- Overall winner based on total stats

## Running the Server

To start the MCP server:

```bash
cd mcp
npm run build
node build/index.js
```

The server runs on stdio and will output: `Superhero MCP Server running on stdio`

## Configuration

The MCP server is configured in `mcp.json` at the repository root:

```json
{
    "servers": {
        "superheroes-mcp": {
            "command": "node",
            "args": [
                "${workspaceFolder}/mcp/build/index.js"
            ]
        }
    }
}
```

## Testing

Run the comprehensive test suite to verify all tools:

```bash
cd mcp
node tests/test-all-tools.js
```

## Data Source

All superhero data is loaded from `/mcp/data/superheroes.json` which contains 17 superheroes with complete powerstat information.
