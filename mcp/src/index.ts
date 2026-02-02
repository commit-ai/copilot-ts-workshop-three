#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

interface Superhero {
  id: string | number;
  name: string;
  image: string;
  powerstats: Powerstats;
}

async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data", "superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    throw new Error(
      `Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function formatSuperheroMarkdown(hero: Superhero): string {
  return `Here is the data for ${hero.name} retrieved using the superheroes MCP:

• Name: ${hero.name}
• Image: <img src="${hero.image}" alt="${hero.name}"/>
• Powerstats:
  • Intelligence: ${hero.powerstats.intelligence}
  • Strength: ${hero.powerstats.strength}
  • Speed: ${hero.powerstats.speed}
  • Durability: ${hero.powerstats.durability}
  • Power: ${hero.powerstats.power}
  • Combat: ${hero.powerstats.combat}`;
}

const server = new McpServer({
  name: "superheroes-mcp",
  version: "1.0.0",
});

// Tool: get_superhero
server.tool(
  "get_superhero",
  "Get superhero details by name or id",
  {
    name: z.string().optional().describe("Name of the superhero (optional)"),
    id: z.string().optional().describe("ID of the superhero (optional)"),
  },
  async ({ name, id }: { name?: string; id?: string }) => {
    const superheroes = await loadSuperheroes();
    const nameLc = name?.toLowerCase() ?? "";
    const idStr = id?.toString() ?? "";

    const hero = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return (
        (nameLc && heroNameLc === nameLc) || (idStr && heroIdStr === idStr)
      );
    });

    if (!hero) {
      throw new Error("Superhero not found");
    }

    return {
      content: [
        {
          type: "text",
          text: formatSuperheroMarkdown(hero),
        },
      ],
    };
  }
);

// Tool: list-superheros
server.tool(
  "list-superheros",
  "List all superheroes with their basic information",
  {},
  async () => {
    const superheroes = await loadSuperheroes();

    const heroList = superheroes
      .map((hero) => `• ${hero.name} (ID: ${hero.id})`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Here is the list of all superheroes retrieved using the superheroes MCP:\n\n${heroList}\n\nTotal: ${superheroes.length} superheroes`,
        },
      ],
    };
  }
);

// Tool: compare-suoerheros
server.tool(
  "compare-suoerheros",
  "Compare two superheroes by their powerstats",
  {
    hero1: z.string().describe("Name or ID of the first superhero"),
    hero2: z.string().describe("Name or ID of the second superhero"),
  },
  async ({ hero1, hero2 }: { hero1: string; hero2: string }) => {
    const superheroes = await loadSuperheroes();

    // Find first hero
    const hero1Lc = hero1.toLowerCase();
    const foundHero1 = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === hero1Lc || heroIdStr === hero1;
    });

    if (!foundHero1) {
      throw new Error(`First superhero not found: ${hero1}`);
    }

    // Find second hero
    const hero2Lc = hero2.toLowerCase();
    const foundHero2 = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === hero2Lc || heroIdStr === hero2;
    });

    if (!foundHero2) {
      throw new Error(`Second superhero not found: ${hero2}`);
    }

    // Compare powerstats
    const stats = [
      "intelligence",
      "strength",
      "speed",
      "durability",
      "power",
      "combat",
    ] as const;

    let comparison = `Comparison between ${foundHero1.name} and ${foundHero2.name}:\n\n`;

    stats.forEach((stat) => {
      const val1 = foundHero1.powerstats[stat];
      const val2 = foundHero2.powerstats[stat];
      const diff = val1 - val2;
      const winner =
        diff > 0
          ? foundHero1.name
          : diff < 0
            ? foundHero2.name
            : "Tie";

      comparison += `• ${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${foundHero1.name} (${val1}) vs ${foundHero2.name} (${val2}) - Winner: ${winner}\n`;
    });

    // Calculate total stats
    const total1 = stats.reduce(
      (sum, stat) => sum + foundHero1.powerstats[stat],
      0
    );
    const total2 = stats.reduce(
      (sum, stat) => sum + foundHero2.powerstats[stat],
      0
    );

    comparison += `\nTotal Stats: ${foundHero1.name} (${total1}) vs ${foundHero2.name} (${total2})`;
    comparison += `\nOverall Winner: ${total1 > total2 ? foundHero1.name : total1 < total2 ? foundHero2.name : "Tie"}`;

    return {
      content: [
        {
          type: "text",
          text: comparison,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Superhero MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});