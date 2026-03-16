using Microsoft.AspNetCore.Mvc;
using SuperheroesApi.Models;
using SuperheroesApi.Services;

namespace SuperheroesApi.Controllers;

/// <summary>
/// This is a superheroes API controller that supports the following endpoints:
/// 1. GET /api/superheroes - returns a list of all superheroes
/// 2. GET /api/superheroes/{id} - returns a specific superhero by id
/// 3. GET /api/superheroes/{id}/powerstats - returns the powerstats for a superhero by id
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SuperheroesController : ControllerBase
{
    private readonly SuperheroService _superheroService;

    public SuperheroesController(SuperheroService superheroService)
    {
        _superheroService = superheroService;
    }

    /// <summary>
    /// GET /api/superheroes
    /// Returns a list of all superheroes.
    ///
    /// Response: 200 OK - Array of superhero objects
    ///           500 Internal Server Error - If data cannot be read
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var superheroes = await _superheroService.LoadSuperheroesAsync();
            return Ok(superheroes);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error loading superheroes data: {ex}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    /// <summary>
    /// GET /api/superheroes/{id}
    /// Returns a single superhero by their unique ID.
    ///
    /// Params: id (int) - The unique identifier of the superhero
    /// Response: 200 OK - Superhero object
    ///           404 Not Found - If the superhero does not exist
    ///           500 Internal Server Error - If data cannot be read
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        try
        {
            var superheroes = await _superheroService.LoadSuperheroesAsync();
            var superhero = superheroes.FirstOrDefault(h => h.Id.ToString() == id);
            if (superhero == null)
            {
                return NotFound("Superhero not found");
            }
            return Ok(superhero);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error loading superheroes data: {ex}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    /// <summary>
    /// GET /api/superheroes/{id}/powerstats
    /// Returns the powerstats for a superhero by their unique ID.
    ///
    /// Params: id (int) - The unique identifier of the superhero
    /// Response: 200 OK - Powerstats object
    ///           404 Not Found - If the superhero does not exist
    ///           500 Internal Server Error - If data cannot be read
    /// </summary>
    [HttpGet("{id}/powerstats")]
    public async Task<IActionResult> GetPowerstats(string id)
    {
        try
        {
            var superheroes = await _superheroService.LoadSuperheroesAsync();
            var superhero = superheroes.FirstOrDefault(h => h.Id.ToString() == id);
            if (superhero == null)
            {
                return NotFound("Superhero not found");
            }
            return Ok(superhero.Powerstats);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error loading superheroes data: {ex}");
            return StatusCode(500, "Internal Server Error");
        }
    }
}
