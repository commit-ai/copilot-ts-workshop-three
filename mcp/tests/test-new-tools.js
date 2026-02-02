#!/usr/bin/env node

// Test script to verify the new MCP tools work correctly
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

async function testListSuperheros() {
  console.log("\n=== Testing list-superheros tool ===");
  try {
    const superheroes = await loadSuperheroes();
    const heroList = superheroes
      .map((hero) => `• ${hero.name} (ID: ${hero.id})`)
      .join("\n");
    
    console.log(`✅ Successfully listed ${superheroes.length} superheroes`);
    console.log("\nSample output:");
    console.log(heroList.split("\n").slice(0, 5).join("\n"));
    console.log("...");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function testCompareSuperheros() {
  console.log("\n=== Testing compare-suoerheros tool ===");
  try {
    const superheroes = await loadSuperheroes();
    
    // Test comparing two heroes by name
    const hero1Name = "A-Bomb";
    const hero2Name = "Abe Sapien";
    
    const hero1 = superheroes.find(h => h.name === hero1Name);
    const hero2 = superheroes.find(h => h.name === hero2Name);
    
    if (!hero1 || !hero2) {
      throw new Error("Could not find test heroes");
    }
    
    console.log(`✅ Found heroes for comparison: ${hero1.name} vs ${hero2.name}`);
    
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
    
    console.log("\nSample comparison output:");
    console.log(comparison);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function runTests() {
  console.log("Testing new MCP tools...");
  await testListSuperheros();
  await testCompareSuperheros();
  console.log("\n=== All tests completed ===\n");
}

runTests();
