using System.Text.Json;
using System.Text.Json.Serialization;
using SuperheroesApi.Models;

namespace SuperheroesApi.Services;

/// <summary>
/// Service for loading superhero data from the JSON file.
/// </summary>
public class SuperheroService
{
    private readonly string _dataPath;

    public SuperheroService(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "superheroes.json");
    }

    /// <summary>
    /// Loads all superheroes from the JSON data file.
    /// </summary>
    public async Task<List<Superhero>> LoadSuperheroesAsync()
    {
        var json = await File.ReadAllTextAsync(_dataPath);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        return JsonSerializer.Deserialize<List<Superhero>>(json, options) ?? new List<Superhero>();
    }
}
