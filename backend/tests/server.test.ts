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
      intelligence: 100,
      strength: 18,
      speed: 23,
      durability: 28,
      power: 32,
      combat: 32
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

describe('POST /api/superheroes/compare', () => {
  it('should return a battle story when comparing two superheroes', async () => {
    const hero1 = {
      name: 'A-Bomb',
      powerstats: {
        intelligence: 38,
        strength: 100,
        speed: 17,
        durability: 80,
        power: 24,
        combat: 64
      }
    };
    const hero2 = {
      name: 'Ant-Man',
      powerstats: {
        intelligence: 100,
        strength: 18,
        speed: 23,
        durability: 28,
        power: 32,
        combat: 32
      }
    };

    const response = await request(app)
      .post('/api/superheroes/compare')
      .send({ hero1, hero2 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('story');
    expect(typeof response.body.story).toBe('string');
    expect(response.body.story.length).toBeLessThanOrEqual(800);
    expect(response.body.story).toContain('A-Bomb');
    expect(response.body.story).toContain('Ant-Man');
  });

  it('should return 400 if hero1 is missing', async () => {
    const hero2 = {
      name: 'Ant-Man',
      powerstats: {
        intelligence: 100,
        strength: 18,
        speed: 23,
        durability: 28,
        power: 32,
        combat: 32
      }
    };

    const response = await request(app)
      .post('/api/superheroes/compare')
      .send({ hero2 });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Invalid request');
  });

  it('should return 400 if hero2 is missing powerstats', async () => {
    const hero1 = {
      name: 'A-Bomb',
      powerstats: {
        intelligence: 38,
        strength: 100,
        speed: 17,
        durability: 80,
        power: 24,
        combat: 64
      }
    };
    const hero2 = {
      name: 'Ant-Man'
    };

    const response = await request(app)
      .post('/api/superheroes/compare')
      .send({ hero1, hero2 });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Invalid request');
  });

  it('should handle evenly matched heroes', async () => {
    const hero1 = {
      name: 'Hero A',
      powerstats: {
        intelligence: 50,
        strength: 50,
        speed: 50,
        durability: 50,
        power: 50,
        combat: 50
      }
    };
    const hero2 = {
      name: 'Hero B',
      powerstats: {
        intelligence: 55,
        strength: 45,
        speed: 50,
        durability: 50,
        power: 50,
        combat: 50
      }
    };

    const response = await request(app)
      .post('/api/superheroes/compare')
      .send({ hero1, hero2 });

    expect(response.status).toBe(200);
    expect(response.body.story).toContain('evenly matched');
  });
});

