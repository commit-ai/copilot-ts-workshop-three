#!/usr/bin/env node

// Simple test script to verify the compare_superheroes tool
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

function generateBattleStory(hero1, hero2) {
  // Calculate total power for each hero
  const calculateTotalPower = (stats) => {
    return stats.intelligence + stats.strength + stats.speed + 
           stats.durability + stats.power + stats.combat;
  };

  const hero1Power = calculateTotalPower(hero1.powerstats);
  const hero2Power = calculateTotalPower(hero2.powerstats);

  // Determine winner and create battle story
  const powerDiff = Math.abs(hero1Power - hero2Power);
  const winner = hero1Power >= hero2Power ? hero1 : hero2;
  const loser = hero1Power >= hero2Power ? hero2 : hero1;

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

async function testCompare() {
  console.log("Testing compare_superheroes functionality...\n");
  
  try {
    const superheroes = await loadSuperheroes();
    console.log(`✅ Successfully loaded ${superheroes.length} superheroes\n`);
    
    // Test 1: Compare A-Bomb vs Ant-Man
    const aBomb = superheroes.find(h => h.name === "A-Bomb");
    const antMan = superheroes.find(h => h.name === "Ant-Man");
    
    if (aBomb && antMan) {
      console.log("Test 1: A-Bomb vs Ant-Man");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const story1 = generateBattleStory(aBomb, antMan);
      console.log(story1);
      console.log(`\nStory length: ${story1.length} characters`);
      console.log(story1.length <= 800 ? "✅ Story is under 800 characters" : "❌ Story exceeds 800 characters");
      console.log();
    }
    
    // Test 2: Compare Ant-Man vs Bane
    const bane = superheroes.find(h => h.name === "Bane");
    
    if (antMan && bane) {
      console.log("Test 2: Ant-Man vs Bane");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const story2 = generateBattleStory(antMan, bane);
      console.log(story2);
      console.log(`\nStory length: ${story2.length} characters`);
      console.log(story2.length <= 800 ? "✅ Story is under 800 characters" : "❌ Story exceeds 800 characters");
      console.log();
    }
    
    // Test 3: Compare A-Bomb vs Bane
    if (aBomb && bane) {
      console.log("Test 3: A-Bomb vs Bane");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const story3 = generateBattleStory(aBomb, bane);
      console.log(story3);
      console.log(`\nStory length: ${story3.length} characters`);
      console.log(story3.length <= 800 ? "✅ Story is under 800 characters" : "❌ Story exceeds 800 characters");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCompare();
