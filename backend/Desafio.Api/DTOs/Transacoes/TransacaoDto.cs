using Desafio.Api.Models;

namespace Desafio.Api.DTOs.Transacoes;

public sealed record TransacaoDto(
    int Id,
    string Descricao,
    decimal Valor,
    TipoTransacao Tipo,
    int PessoaId,
    string PessoaNome
);