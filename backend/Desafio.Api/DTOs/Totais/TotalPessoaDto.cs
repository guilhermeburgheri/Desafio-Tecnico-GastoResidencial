namespace Desafio.Api.DTOs.Totais;

public sealed record TotalPessoaDto(
    int PessoaId,
    string PessoaNome,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo
);