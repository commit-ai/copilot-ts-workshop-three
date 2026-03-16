# GitHub Copilot Workshop - .NET + React

**Legal Disclaimer:**

This repository contains proprietary workshop code and materials. The contents are the intellectual property of Commit AI and are provided solely for the purposes of the associated workshop by paying customers.

**You may not use, copy, distribute, or share any part of this code or its contents without explicit written consent from Commit AI.**

---

## Workshop Overview

This workshop explores GitHub Copilot's capabilities through building a **Superheroes API** with:

- **Backend**: ASP.NET Core Web API (C#)
- **Frontend**: React (Vite)
- **MCP Server**: TypeScript Model Context Protocol server

## Project Structure

```
├── backend/               # ASP.NET Core Web API
│   ├── Controllers/       # API endpoint controllers
│   ├── Models/            # Data models
│   ├── Services/          # Business logic services
│   ├── Data/              # superheroes.json data file
│   ├── wwwroot/images/    # Static superhero images
│   └── tests/             # xUnit integration tests
├── frontend/              # React (Vite) frontend
│   ├── src/               # React components and styles
│   └── tests/             # Playwright E2E tests
└── mcp/                   # TypeScript MCP server
    ├── src/               # MCP server source
    └── tests/             # MCP verification tests
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

### Backend Setup

```bash
cd backend

# Restore dependencies
dotnet restore SuperheroesWorkshop.slnx

# Run the API server (starts on http://localhost:5000)
dotnet run --project SuperheroesApi.csproj

# Run tests
dotnet test tests/SuperheroesApi.Tests.csproj
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (starts on http://localhost:3001, proxies API to port 5000)
npm start

# Run E2E tests (requires backend running)
npm test
```

### MCP Server Setup

```bash
cd mcp

# Install dependencies
npm install

# Build the MCP server
npm run build

# Test the MCP server
node tests/test-mcp.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check - returns "Save the World!" |
| `GET` | `/api/superheroes` | List all superheroes |
| `GET` | `/api/superheroes/{id}` | Get superhero by ID |
| `GET` | `/api/superheroes/{id}/powerstats` | Get powerstats by ID |
| `POST` | `/api/battle-narration` | Generate AI battle narration |

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_superhero` | Get superhero details by name or ID |
| `list-superheroes` | List all superheroes with IDs and names |
| `compare-superheroes` | Compare two superheroes across all powerstat dimensions |

## Workshop Exercises

The following features are left as exercises during the workshop:

1. **Battle Narration** (`backend/Services/BattleNarrationService.cs`): Implement AI-powered battle narration using GitHub Copilot SDK. Look for `BATTLE_PLACEHOLDER` comments.

2. **MCP Server** (`mcp/src/index.ts`): Implement the MCP server with superhero tools. See `mcp/prompt.md` for detailed requirements.
