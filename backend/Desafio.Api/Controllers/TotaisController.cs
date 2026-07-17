using Desafio.Api.Data;
using Desafio.Api.DTOs.Totais;
using Desafio.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Controllers;

[ApiController]
[Route("api/totais")]
public sealed class TotaisController : ControllerBase
{
    private readonly AppDbContext _context;

    public TotaisController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ResumoTotaisDto>> Consultar()
    {
        var pessoas = await _context.Pessoas
            .AsNoTracking()
            .Include(pessoa => pessoa.Transacoes)
            .OrderBy(pessoa => pessoa.Id)
            .ToListAsync();

        var totaisPorPessoa = pessoas
            .Select(pessoa =>
            {
                var totalReceitas = pessoa.Transacoes
                    .Where(transacao =>
                        transacao.Tipo == TipoTransacao.Receita
                    )
                    .Sum(transacao => transacao.Valor);

                var totalDespesas = pessoa.Transacoes
                    .Where(transacao =>
                        transacao.Tipo == TipoTransacao.Despesa
                    )
                    .Sum(transacao => transacao.Valor);

                var saldo = totalReceitas - totalDespesas;

                return new TotalPessoaDto(
                    pessoa.Id,
                    pessoa.Nome,
                    totalReceitas,
                    totalDespesas,
                    saldo
                );
            })
            .ToList();

        var totalGeralReceitas = totaisPorPessoa
            .Sum(total => total.TotalReceitas);

        var totalGeralDespesas = totaisPorPessoa
            .Sum(total => total.TotalDespesas);

        var saldoGeral = totalGeralReceitas - totalGeralDespesas;

        var resposta = new ResumoTotaisDto(
            totaisPorPessoa,
            totalGeralReceitas,
            totalGeralDespesas,
            saldoGeral
        );

        return Ok(resposta);
    }
}