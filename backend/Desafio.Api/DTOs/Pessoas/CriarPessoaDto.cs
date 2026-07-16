using System.ComponentModel.DataAnnotations;

namespace Desafio.Api.DTOs.Pessoas;

public sealed class CriarPessoaDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "O nome deve possuir entre 2 e 100 caracteres."
    )]
    public string Nome { get; set; } = string.Empty;

    [Range(
        0,
        150,
        ErrorMessage = "A idade deve estar entre 0 e 150 anos."
    )]
    public int Idade { get; set; }
}