using SuperheroesApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddSingleton<SuperheroService>();
builder.Services.AddScoped<BattleNarrationService>();

// Configure CORS for local development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Enable static files (serves images from wwwroot/)
app.UseStaticFiles();

app.UseCors();

app.MapControllers();

// Root health check route
app.MapGet("/", () => "Save the World!");

app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
