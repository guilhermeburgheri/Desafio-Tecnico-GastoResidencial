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
    }
}