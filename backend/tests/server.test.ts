import request from 'supertest';
import app from '../src/server';

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return all superheroes as an array', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Check that required fields exist
    response.body.forEach(hero => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/2/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 88,
      strength: 28,
      speed: 35,
      durability: 65,
      power: 100,
      combat: 85
    });
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/xyz/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/search', () => {
  it('should return matching heroes for a valid query', async () => {
    const response = await request(app).get('/api/superheroes/search?q=Adam');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Every result should contain "Adam" (case-insensitive)
    response.body.forEach((hero: any) => {
      expect(hero.name.toLowerCase()).toContain('adam');
    });
  });

  it('should return results ordered by match quality (best first)', async () => {
    // "A-Bomb" is an exact-starts-with match for "a-bomb"
    const response = await request(app).get('/api/superheroes/search?q=a-bomb');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe('A-Bomb');
  });

  it('should return an empty array when no heroes match', async () => {
    const response = await request(app).get('/api/superheroes/search?q=zzzznotahero');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return the full list when query is empty', async () => {
    const response = await request(app).get('/api/superheroes/search?q=');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(17);
  });

  it('should return the full list when q param is missing', async () => {
    const response = await request(app).get('/api/superheroes/search');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(17);
  });

  it('should handle special characters without throwing', async () => {
    const response = await request(app).get('/api/superheroes/search?q=*?([]');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // No crash — just returns an array (possibly empty)
  });
});

