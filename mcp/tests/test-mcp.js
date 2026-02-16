#!/usr/bin/env node

// Simple test script to verify the MCP server can load data correctly
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
    throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
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

async function testListSuperheroes() {
  console.log("\n--- Test: list-superheroes ---");
  try {
    const superheroes = await loadSuperheroes();
    if (superheroes.length === 0) {
      console.log("❌ list-superheroes: No superheroes found");
      return;
    }
    
    // Format list output
    const listOutput = superheroes
      .map(h => `• ID: ${h.id} - ${h.name}`)
      .join("\n");
    
    console.log(`✅ list-superheroes: Retrieved ${superheroes.length} heroes`);
    console.log("First few heroes:");
    console.log(listOutput.split("\n").slice(0, 5).join("\n"));
  } catch (error) {
    console.error("❌ list-superheroes test failed:", error.message);
  }
}

async function testCompareSuperheroes() {
  console.log("\n--- Test: compare-superheroes ---");
  try {
    const superheroes = await loadSuperheroes();
    
    // Compare Abomination (ID 4) vs Absorbing Man (ID 6)
    const hero1 = superheroes.find(h => h.id?.toString() === "4");
    const hero2 = superheroes.find(h => h.id?.toString() === "6");
    
    if (!hero1 || !hero2) {
      console.log("❌ compare-superheroes: Could not find both heroes");
      return;
    }
    
    console.log(`✅ compare-superheroes: Found ${hero1.name} and ${hero2.name}`);
    
    // Calculate comparison
    const stats = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    let hero1Total = 0, hero2Total = 0;
    
    console.log("Stat Comparison:");
    stats.forEach(stat => {
      const val1 = hero1.powerstats[stat];
      const val2 = hero2.powerstats[stat];
      hero1Total += val1;
      hero2Total += val2;
      
      const winner = val1 > val2 ? hero1.name : val1 < val2 ? hero2.name : "Tie";
      console.log(`  ${stat}: ${hero1.name} (${val1}) vs ${hero2.name} (${val2}) - Winner: ${winner}`);
    });
    
    const overallWinner = hero1Total > hero2Total ? hero1.name : hero1Total < hero2Total ? hero2.name : "Tie";
    console.log(`Overall winner: ${overallWinner} (${Math.max(hero1Total, hero2Total)} total stats)`);
    
  } catch (error) {
    console.error("❌ compare-superheroes test failed:", error.message);
  }
}

async function testMCP() {
  console.log("Testing MCP server functionality...");
  
  try {
    const superheroes = await loadSuperheroes();
    console.log(`✅ Successfully loaded ${superheroes.length} superheroes`);
    
    // Test finding by name (case insensitive)
    const abomination = superheroes.find(h => h.name?.toLowerCase() === "abomination");
    if (abomination) {
      console.log("✅ Found Abomination by name");
      console.log(formatSuperheroMarkdown(abomination));
    } else {
      console.log("❌ Could not find Abomination");
    }
    
    // Test finding by ID
    const hero1 = superheroes.find(h => h.id?.toString() === "1");
    if (hero1) {
      console.log(`✅ Found hero by ID 1: ${hero1.name}`);
    } else {
      console.log("❌ Could not find hero with ID 1");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testMCP();
testListSuperheroes();
testCompareSuperheroes();
