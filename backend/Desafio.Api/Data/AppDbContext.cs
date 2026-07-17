using Desafio.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Pessoa> Pessoas => Set<Pessoa>();

    public DbSet<Transacao> Transacoes => Set<Transacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Pessoa>(entity =>
        {
            entity.ToTable("Pessoas");

            entity.HasKey(pessoa => pessoa.Id);

            entity.Property(pessoa => pessoa.Nome)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(pessoa => pessoa.Idade)
                .IsRequired();
        });

        modelBuilder.Entity<Transacao>(entity =>
        {
            entity.ToTable("Transacoes");

            entity.HasKey(transacao => transacao.Id);

            entity.Property(transacao => transacao.Descricao)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(transacao => transacao.Valor)
                .IsRequired();

            entity.Property(transacao => transacao.Tipo)
                .IsRequired();

            entity.Property(transacao => transacao.PessoaId)
                .IsRequired();

            entity.HasOne(transacao => transacao.Pessoa)
                .WithMany(pessoa => pessoa.Transacoes)
                .HasForeignKey(transacao => transacao.PessoaId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}