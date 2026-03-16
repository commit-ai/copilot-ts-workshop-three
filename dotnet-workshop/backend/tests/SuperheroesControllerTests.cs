using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace SuperheroesApi.Tests;

public class SuperheroesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SuperheroesControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Get_Root_Returns_SaveTheWorld()
    {
        var response = await _client.GetAsync("/");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Equal("Save the World!", text);
    }

    [Fact]
    public async Task Get_AllSuperheroes_Returns_Array()
    {
        var response = await _client.GetAsync("/api/superheroes");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var heroes = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(heroes);
        Assert.True(heroes.Length > 0);

        foreach (var hero in heroes)
        {
            Assert.True(hero.TryGetProperty("id", out _));
            Assert.True(hero.TryGetProperty("name", out _));
            Assert.True(hero.TryGetProperty("image", out _));
            Assert.True(hero.TryGetProperty("powerstats", out _));
        }
    }

    [Fact]
    public async Task Get_SuperheroById_Returns_Correct_Hero()
    {
        var response = await _client.GetAsync("/api/superheroes/1");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var hero = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, hero.GetProperty("id").GetInt32());
        Assert.Equal("A-Bomb", hero.GetProperty("name").GetString());
    }

    [Fact]
    public async Task Get_SuperheroById_NotFound_Returns_404()
    {
        var response = await _client.GetAsync("/api/superheroes/9999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Contains("Superhero not found", text);
    }

    [Fact]
    public async Task Get_SuperheroById_NonNumeric_Returns_404()
    {
        var response = await _client.GetAsync("/api/superheroes/abc");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Contains("Superhero not found", text);
    }

    [Fact]
    public async Task Get_Powerstats_Returns_Correct_Stats()
    {
        var response = await _client.GetAsync("/api/superheroes/2/powerstats");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var stats = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(88, stats.GetProperty("intelligence").GetInt32());
        Assert.Equal(28, stats.GetProperty("strength").GetInt32());
        Assert.Equal(35, stats.GetProperty("speed").GetInt32());
        Assert.Equal(65, stats.GetProperty("durability").GetInt32());
        Assert.Equal(100, stats.GetProperty("power").GetInt32());
        Assert.Equal(85, stats.GetProperty("combat").GetInt32());
    }

    [Fact]
    public async Task Get_Powerstats_NotFound_Returns_404()
    {
        var response = await _client.GetAsync("/api/superheroes/9999/powerstats");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Contains("Superhero not found", text);
    }

    [Fact]
    public async Task Get_Powerstats_NonNumeric_Returns_404()
    {
        var response = await _client.GetAsync("/api/superheroes/xyz/powerstats");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Contains("Superhero not found", text);
    }
}
