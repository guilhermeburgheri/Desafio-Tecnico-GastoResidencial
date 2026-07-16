using Desafio.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Registro dos Controllers
builder.Services.AddControllers();

// Documentação OpenAPI.
builder.Services.AddOpenApi();

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "A conexão 'DefaultConnection' não foi configurada."
    );

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString)
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


app.MapGet("/", () => Results.Ok(new
{
    mensagem = "API de controle de gastos residenciais em execução."
}));

app.MapControllers();

app.Run();