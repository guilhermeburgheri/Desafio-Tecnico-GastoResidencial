using Desafio.Api.Data;
using Desafio.Api.DTOs.Transacoes;
using Desafio.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Controllers;

[ApiController]
[Route("api/transacoes")]
public sealed class TransacoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransacaoDto>>> Listar()
    {
        var transacoes = await _context.Transacoes
            .AsNoTracking()
            .OrderBy(transacao => transacao.Id)
            .Select(transacao => new TransacaoDto(
                transacao.Id,
                transacao.Descricao,
                transacao.Valor,
                transacao.Tipo,
                transacao.PessoaId,
                transacao.Pessoa.Nome
            ))
            .ToListAsync();

        return Ok(transacoes);
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoDto>> Criar(
        CriarTransacaoDto dto
    )
    {
        var descricao = dto.Descricao.Trim();

        if (string.IsNullOrWhiteSpace(descricao))
        {
            return BadRequest(new
            {
                mensagem = "A descrição é obrigatória."
            });
        }

        if (!Enum.IsDefined(typeof(TipoTransacao), dto.Tipo))
        {
            return BadRequest(new
            {
                mensagem = "O tipo da transação é inválido."
            });
        }

        var pessoa = await _context.Pessoas.FindAsync(dto.PessoaId);

        if (pessoa is null)
        {
            return NotFound(new
            {
                mensagem = "Pessoa não encontrada."
            });
        }

        if (pessoa.Idade < 18 &&
            dto.Tipo == TipoTransacao.Receita)
        {
            return BadRequest(new
            {
                mensagem =
                    "Pessoas menores de 18 anos não podem cadastrar receitas."
            });
        }

        var transacao = new Transacao
        {
            Descricao = descricao,
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            PessoaId = pessoa.Id
        };

        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();

        var resposta = new TransacaoDto(
            transacao.Id,
            transacao.Descricao,
            transacao.Valor,
            transacao.Tipo,
            pessoa.Id,
            pessoa.Nome
        );

        return StatusCode(
            StatusCodes.Status201Created,
            resposta
        );
    }
}