import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
This is a superheroes API server that supports 3 GET endpoints
The data is stored in a JSON file in the project folder called superheroes.json
1. /superheroes/all - returns a list of all superheroes, as a JSON array
2. /superheroes/:id - returns a specific superhero by id, as a JSON object
3. /superheroes/:id/powerstats - returns a the powers statistics for superhero by id, as a JSON object
*/

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

// Root route
/**
 * GET /
 * Root endpoint for health check or welcome message.
 *
 * Response: 200 OK - Returns a welcome string.
 */
app.get('/', (req, res) => {
  res.send('Save the World!');
});

// API route to fetch superheroes data
/**
 * Loads the list of superheroes from a JSON file asynchronously.
 *
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data containing superheroes,
 * or rejects if there is an error reading or parsing the file.
 * @throws Will reject the promise if the file cannot be read or if the JSON is invalid.
 */
function loadSuperheroes(): Promise<any> {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  return new Promise((resolve, reject) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * GET /api/superheroes
 * Returns a list of all superheroes.
 *
 * Response: 200 OK - Array of superhero objects
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    res.json(superheroes);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id
 * Returns a single superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Superhero object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id/powerstats
 * Returns the powerstats for a superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Powerstats object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id/powerstats', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero.powerstats);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

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
 * Interface for superhero data in compare request
 */
interface SuperheroCompareData {
  name: string;
  powerstats: Powerstats;
}

/**
 * POST /api/superheroes/compare
 * Compares two superheroes and generates a battle story.
 *
 * Body: {
 *   hero1: { name: string, powerstats: Powerstats },
 *   hero2: { name: string, powerstats: Powerstats }
 * }
 * Response: 200 OK - { story: string } - A battle story up to 800 characters
 *           400 Bad Request - If request body is invalid
 *           500 Internal Server Error - If story generation fails
 */
app.post('/api/superheroes/compare', (req, res) => {
  try {
    const { hero1, hero2 } = req.body;

    // Validate input
    if (!hero1 || !hero2 || !hero1.name || !hero2.name || !hero1.powerstats || !hero2.powerstats) {
      res.status(400).send('Invalid request: both hero1 and hero2 with name and powerstats are required');
      return;
    }

    // Calculate total power for each hero
    const calculateTotalPower = (stats: Powerstats): number => {
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
      const topStat: [string, number] = Object.entries(winner.powerstats).reduce((a, b) => a[1] > b[1] ? a : b) as [string, number];
      story += `${topStat[0]} (${topStat[1]}) and overall power (${hero1Power >= hero2Power ? hero1Power : hero2Power}) `;
      story += `proved decisive. ${loser.name} fought bravely but was ultimately overwhelmed.`;
    } else {
      story += `${winner.name} completely dominated the fight! `;
      story += `With overwhelming power (${hero1Power >= hero2Power ? hero1Power : hero2Power} vs ${hero1Power >= hero2Power ? hero2Power : hero1Power}), `;
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

    res.json({ story });
  } catch (err) {
    console.error('Error generating battle story:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Failed to start server:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else if (err.code === 'EACCES') {
        console.error(`Insufficient privileges to bind to port ${PORT}.`);
      }
      process.exit(1);
    });

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    console.error('Unexpected error during server startup:', err);
    process.exit(1);
  }
}

export default app;