import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateBattleNarration } from './utils/battleNarration.js';

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
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files (images and other assets)
app.use(express.static(path.join(__dirname, '../public')));

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
 * Compute a fuzzy match score between a query and a target string.
 * Returns a score >= 0 (higher = better match), or -1 if no match.
 * Plain-text only — the query is never interpreted as a regex.
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match (best)
  if (t === q) return 3;
  // Starts-with
  if (t.startsWith(q)) return 2;
  // Contains substring
  if (t.includes(q)) return 1;

  // Character-sequence match (each query char appears in order)
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  if (qi === q.length) return 0.5;

  return -1; // no match
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
 * GET /api/superheroes/search?q=<query>
 * Searches superheroes by name using fuzzy matching.
 *
 * Query params: q (string) - The search query (plain text, not regex)
 * Response: 200 OK - Array of matching superhero objects sorted by match quality
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/search', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    const rawQuery = (req.query.q as string) ?? '';
    const query = rawQuery.trim();

    // Empty / missing query → return the full list (same as /api/superheroes)
    if (!query) {
      res.json(superheroes);
      return;
    }

    // Score every hero, keep only matches (score >= 0)
    const scored = superheroes
      .map((hero: any) => ({ hero, score: fuzzyScore(query, hero.name) }))
      .filter((item: any) => item.score >= 0);

    // Sort by score desc, then name asc, then id asc for stability
    scored.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      const nameCompare = a.hero.name.localeCompare(b.hero.name);
      if (nameCompare !== 0) return nameCompare;
      return a.hero.id - b.hero.id;
    });

    res.json(scored.map((item: any) => item.hero));
  } catch (err) {
    console.error('Error searching superheroes:', err);
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
 * POST /api/battle-narration
 * Generates a cinematic battle narration between two superheroes.
 *
 * Body: { hero1: object, hero2: object } - Two superhero objects with id, name, image, powerstats
 * Response: 200 OK - { narration: string } - Epic battle narration
 *           400 Bad Request - If heroes are invalid or missing
 *           500 Internal Server Error - If narration generation fails
 */
app.post('/api/battle-narration', async (req, res) => {
  try {
    const { hero1, hero2 } = req.body;
    
    if (!hero1 || !hero2 || !hero1.id || !hero2.id) {
      res.status(400).json({ error: 'Both heroes must be provided with valid data' });
      return;
    }

    const result = await generateBattleNarration(hero1, hero2);
    res.json({ narration: result });
  } catch (err) {
    console.error('Error generating battle narration:', err);
    res.status(500).json({ error: 'Failed to generate battle narration' });
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