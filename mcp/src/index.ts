#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Get proper __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Interface for superhero powerstats
 */
interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

/**
 * Interface for superhero data
 */
interface Superhero {
  id: string | number;
  name: string;
  image: string;
  powerstats: Powerstats;
}

/**
 * Load superheroes data from JSON file
 */
async function loadSuperheroes(): Promise<Superhero[]> {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "../data", "superheroes.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Format superhero data as markdown
 */
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

/**
 * Generate battle story between two superheroes
 */
function generateBattleStory(hero1: Superhero, hero2: Superhero): string {
  // Calculate total power for each hero
  const calculateTotalPower = (stats: Powerstats): number => {
    return stats.intelligence + stats.strength + stats.speed + 
           stats.durability + stats.power + stats.combat;
  };

  const hero1Power = calculateTotalPower(hero1.powerstats);
  const hero2Power = calculateTotalPower(hero2.powerstats);

  // Determine winner and create battle story
  const powerDiff = Math.abs(hero1Power - hero2Power);
  const winner = hero1Power > hero2Power ? hero1 : hero2;
  const loser = hero1Power > hero2Power ? hero2 : hero1;

  // Create a narrative based on the stats comparison
  let story = `In an epic battle between ${hero1.name} and ${hero2.name}, `;

  if (powerDiff < 20) {
    story += `the two heroes were nearly evenly matched! Both fighters displayed incredible prowess. `;
    story += `${hero1.name} (power: ${hero1Power}) traded fierce blows with ${hero2.name} (power: ${hero2Power}). `;
    story += `After an intense struggle, ${winner.name} emerged victorious by the narrowest of margins, `;
    story += `earning the respect of their worthy opponent.`;
  } else if (powerDiff < 50) {
    story += `${winner.name} held a clear advantage with superior abilities. `;
    story += `Despite ${loser.name}'s valiant effort, ${winner.name}'s combination of `;
    const topStat = Object.entries(winner.powerstats).reduce((a, b) => a[1] > b[1] ? a : b);
    story += `${topStat[0]} (${topStat[1]}) and overall power (${hero1Power > hero2Power ? hero1Power : hero2Power}) `;
    story += `proved decisive. ${loser.name} fought bravely but was ultimately overwhelmed.`;
  } else {
    story += `${winner.name} completely dominated the fight! `;
    story += `With overwhelming power (${hero1Power > hero2Power ? hero1Power : hero2Power} vs ${hero1Power > hero2Power ? hero2Power : hero1Power}), `;
    story += `${winner.name} showcased superior `;
    const stats = [];
    if (winner.powerstats.strength > loser.powerstats.strength + 20) stats.push('strength');
    if (winner.powerstats.speed > loser.powerstats.speed + 20) stats.push('speed');
    if (winner.powerstats.combat > loser.powerstats.combat + 20) stats.push('combat');
    story += stats.length > 0 ? stats.join(', ') + '. ' : 'abilities across the board. ';
    story += `${loser.name} never stood a chance against such overwhelming might.`;
  }

  // Ensure story is under 800 characters
  if (story.length > 800) {
    story = story.substring(0, 797) + '...';
  }

  return story;
}

// Create MCP server
const server = new McpServer({
  name: "superheroes-mcp",
  version: "1.0.0"
});

// Register get_superhero tool
server.tool(
  "get_superhero",
  "Get superhero details by name or id",
  {
    name: z.string().optional().describe("Name of the superhero (optional)"),
    id: z.string().optional().describe("ID of the superhero (optional)")
  },
  async ({ name, id }: { name?: string; id?: string }) => {
    const superheroes = await loadSuperheroes();
    
    const nameLc = name?.toLowerCase() ?? "";
    const idStr = id ?? "";
    
    const hero = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === nameLc || heroIdStr === idStr;
    });
    
    if (!hero) {
      throw new Error("Superhero not found");
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: formatSuperheroMarkdown(hero)
        }
      ]
    };
  }
);

// Register compare_superheroes tool for battle simulation
server.tool(
  "compare_superheroes",
  "Compare two superheroes and generate a battle story (up to 800 characters)",
  {
    hero1_name: z.string().describe("Name or ID of the first superhero"),
    hero2_name: z.string().describe("Name or ID of the second superhero")
  },
  async ({ hero1_name, hero2_name }: { hero1_name: string; hero2_name: string }) => {
    const superheroes = await loadSuperheroes();
    
    // Find first hero
    const hero1NameLc = hero1_name.toLowerCase();
    const hero1 = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === hero1NameLc || heroIdStr === hero1_name;
    });
    
    if (!hero1) {
      throw new Error(`Superhero ${hero1_name} not found`);
    }
    
    // Find second hero
    const hero2NameLc = hero2_name.toLowerCase();
    const hero2 = superheroes.find((h) => {
      const heroNameLc = h.name?.toLowerCase() ?? "";
      const heroIdStr = h.id?.toString() ?? "";
      return heroNameLc === hero2NameLc || heroIdStr === hero2_name;
    });
    
    if (!hero2) {
      throw new Error(`Superhero ${hero2_name} not found`);
    }
    
    const story = generateBattleStory(hero1, hero2);
    
    return {
      content: [
        {
          type: "text" as const,
          text: story
        }
      ]
    };
  }
);

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Superhero MCP Server running on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
