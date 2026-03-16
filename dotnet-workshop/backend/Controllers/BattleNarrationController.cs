using Microsoft.AspNetCore.Mvc;
using SuperheroesApi.Models;
using SuperheroesApi.Services;

namespace SuperheroesApi.Controllers;

/// <summary>
/// Controller for AI-powered battle narration between two superheroes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BattleNarrationController : ControllerBase
{
    private readonly BattleNarrationService _battleNarrationService;

    public BattleNarrationController(BattleNarrationService battleNarrationService)
    {
        _battleNarrationService = battleNarrationService;
    }

    /// <summary>
    /// POST /api/battle-narration
    /// Generates a cinematic battle narration between two superheroes.
    ///
    /// Body: { hero1: object, hero2: object } - Two superhero objects with id, name, image, powerstats
    /// Response: 200 OK - { narration: string } - Epic battle narration
    ///           400 Bad Request - If heroes are invalid or missing
    ///           500 Internal Server Error - If narration generation fails
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> GenerateBattleNarration([FromBody] BattleNarrationRequest request)
    {
        if (request.Hero1 == null || request.Hero2 == null ||
            request.Hero1.Id == 0 || request.Hero2.Id == 0)
        {
            return BadRequest(new { error = "Both heroes must be provided with valid data" });
        }

        try
        {
            var narration = await _battleNarrationService.GenerateBattleNarrationAsync(
                request.Hero1, request.Hero2);
            return Ok(new BattleNarrationResponse { Narration = narration });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error generating battle narration: {ex}");
            return StatusCode(500, new { error = "Failed to generate battle narration" });
        }
    }
}
