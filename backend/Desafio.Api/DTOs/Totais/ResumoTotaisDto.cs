namespace Desafio.Api.DTOs.Totais;

public sealed record ResumoTotaisDto(
    List<TotalPessoaDto> Pessoas,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo
);