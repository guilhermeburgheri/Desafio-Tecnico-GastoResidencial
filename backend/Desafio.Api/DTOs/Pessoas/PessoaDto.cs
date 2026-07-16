namespace Desafio.Api.DTOs.Pessoas;

public sealed record PessoaDto(
    int Id,
    string Nome,
    int Idade
);