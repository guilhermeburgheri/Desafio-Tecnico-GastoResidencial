using Desafio.Api.Data;
using Desafio.Api.DTOs.Pessoas;
using Desafio.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Controllers;

[ApiController]
[Route("api/pessoas")]
public sealed class PessoasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PessoasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<PessoaDto>>> Listar()
    {
        var pessoas = await _context.Pessoas
            .AsNoTracking()
            .OrderBy(pessoa => pessoa.Id)
            .Select(pessoa => new PessoaDto(
                pessoa.Id,
                pessoa.Nome,
                pessoa.Idade
            ))
            .ToListAsync();

        return Ok(pessoas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PessoaDto>> ObterPorId(int id)
    {
        var pessoa = await _context.Pessoas
            .AsNoTracking()
            .Where(pessoa => pessoa.Id == id)
            .Select(pessoa => new PessoaDto(
                pessoa.Id,
                pessoa.Nome,
                pessoa.Idade
            ))
            .FirstOrDefaultAsync();

        if (pessoa is null)
        {
            return NotFound(new
            {
                mensagem = "Pessoa não encontrada."
            });
        }

        return Ok(pessoa);
    }

    [HttpPost]
    public async Task<ActionResult<PessoaDto>> Criar(CriarPessoaDto dto)
    {
        var nome = dto.Nome.Trim();

        if (string.IsNullOrWhiteSpace(nome))
        {
            return BadRequest(new
            {
                mensagem = "O nome é obrigatório."
            });
        }

        var pessoa = new Pessoa
        {
            Nome = nome,
            Idade = dto.Idade
        };

        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();

        var resposta = new PessoaDto(
            pessoa.Id,
            pessoa.Nome,
            pessoa.Idade
        );

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = pessoa.Id },
            resposta
        );
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var pessoa = await _context.Pessoas.FindAsync(id);

        if (pessoa is null)
        {
            return NotFound(new
            {
                mensagem = "Pessoa não encontrada."
            });
        }

        _context.Pessoas.Remove(pessoa);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}