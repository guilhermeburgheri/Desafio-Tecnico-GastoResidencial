using System.ComponentModel.DataAnnotations;
using Desafio.Api.Models;

namespace Desafio.Api.DTOs.Transacoes;

public sealed class CriarTransacaoDto
{
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [StringLength(
        150,
        MinimumLength = 2,
        ErrorMessage = "A descrição deve possuir entre 2 e 150 caracteres."
    )]
    public string Descricao { get; set; } = string.Empty;

    [Range(
        typeof(decimal),
        "0.01",
        "999999999.99",
        ParseLimitsInInvariantCulture = true,
        ErrorMessage = "O valor deve ser maior que zero."
    )]
    public decimal Valor { get; set; }

    [EnumDataType(
        typeof(TipoTransacao),
        ErrorMessage = "O tipo da transação é inválido."
    )]
    public TipoTransacao Tipo { get; set; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A pessoa informada é inválida."
    )]
    public int PessoaId { get; set; }
}