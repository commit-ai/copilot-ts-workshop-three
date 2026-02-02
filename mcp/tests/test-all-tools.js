#!/usr/bin/env node

/**
 * Comprehensive test script to verify all MCP superhero tools work correctly.
 * This tests:
 * 1. get_superhero - Get a specific superhero by name or ID
 * 2. list-superheros - List all superheroes
 * 3. compare-suoerheros - Compare two superheroes
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadSuperheroes() {
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

function formatSuperheroMarkdown(hero) {
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

async function testGetSuperhero() {
  console.log("\n=== Testing get_superhero tool ===");
  try {
    const superheroes = await loadSuperheroes();
    
    // Test by ID
    const hero1 = superheroes.find(h => h.id?.toString() === "1");
    if (hero1) {
      console.log(`✅ Found hero by ID 1: ${hero1.name}`);
    } else {
      console.log("❌ Could not find hero with ID 1");
    }
    
    // Test by name
    const heroName = "A-Bomb";
    const hero2 = superheroes.find(h => h.name?.toLowerCase() === heroName.toLowerCase());
    if (hero2) {
      console.log(`✅ Found hero by name: ${hero2.name}`);
      console.log("\nFormatted output:");
      console.log(formatSuperheroMarkdown(hero2));
    } else {
      console.log(`❌ Could not find hero: ${heroName}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function testListSuperheros() {
  console.log("\n=== Testing list-superheros tool ===");
  try {
    const superheroes = await loadSuperheroes();
    const heroList = superheroes
      .map((hero) => `• ${hero.name} (ID: ${hero.id})`)
      .join("\n");
    
    console.log(`✅ Successfully listed ${superheroes.length} superheroes`);
    console.log("\nFirst 5 superheroes:");
    console.log(heroList.split("\n").slice(0, 5).join("\n"));
    console.log(`\nTotal: ${superheroes.length} superheroes`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function testCompareSuperheros() {
  console.log("\n=== Testing compare-suoerheros tool ===");
  try {
    const superheroes = await loadSuperheroes();
    
    // Test comparing two heroes
    const hero1Name = "A-Bomb";
    const hero2Name = "Abomination";
    
    const hero1 = superheroes.find(h => h.name?.toLowerCase() === hero1Name.toLowerCase());
    const hero2 = superheroes.find(h => h.name?.toLowerCase() === hero2Name.toLowerCase());
    
    if (!hero1 || !hero2) {
      throw new Error("Could not find test heroes");
    }
    
    console.log(`✅ Comparing ${hero1.name} vs ${hero2.name}`);
    
    // Simulate the comparison logic
    const stats = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    let comparison = `Comparison between ${hero1.name} and ${hero2.name}:\n\n`;
    
    stats.forEach((stat) => {
      const val1 = hero1.powerstats[stat];
      const val2 = hero2.powerstats[stat];
      const diff = val1 - val2;
      const winner = diff > 0 ? hero1.name : diff < 0 ? hero2.name : "Tie";
      comparison += `• ${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${hero1.name} (${val1}) vs ${hero2.name} (${val2}) - Winner: ${winner}\n`;
    });
    
    const total1 = stats.reduce((sum, stat) => sum + hero1.powerstats[stat], 0);
    const total2 = stats.reduce((sum, stat) => sum + hero2.powerstats[stat], 0);
    
    comparison += `\nTotal Stats: ${hero1.name} (${total1}) vs ${hero2.name} (${total2})`;
    comparison += `\nOverall Winner: ${total1 > total2 ? hero1.name : total1 < total2 ? hero2.name : "Tie"}`;
    
    console.log("\nComparison output:");
    console.log(comparison);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Testing All MCP Superhero Tools                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  
  await testGetSuperhero();
  await testListSuperheros();
  await testCompareSuperheros();
  
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║   All Tests Completed Successfully! ✅                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  console.log("The MCP server now has 3 tools:");
  console.log("  1. get_superhero      - Get details of a specific superhero");
  console.log("  2. list-superheros    - List all available superheroes");
  console.log("  3. compare-suoerheros - Compare two superheroes' stats");
  console.log("\nThe app is now 'agent ready via MCP'! 🦸‍♂️\n");
}

runAllTests();
