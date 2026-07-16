namespace Desafio.Api.Models;

public sealed class Pessoa
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Idade { get; set; }
}