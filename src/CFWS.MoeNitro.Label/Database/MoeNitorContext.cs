using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySQL.Data.EntityFrameworkCore.Extensions;

namespace CFWS.MoeNitro.Label.Database
{
    public class MoeNitorContext : DbContext
    {
        public MoeNitorContext(DbContextOptions<MoeNitorContext> options)
        : base(options)
        { }

        public DbSet<Node> Nodes { get; set; }
        public DbSet<Command> Commands { get; set; }
    }
    public static class MoeNitorContextFactory
    {
        public static string ConnectionString { get; set; }
        public static MoeNitorContext Create()
        {
            var optionsBuilder = new DbContextOptionsBuilder<MoeNitorContext>();
            optionsBuilder.UseMySQL(ConnectionString);

            //Ensure database creation
            var context = new MoeNitorContext(optionsBuilder.Options);
            context.Database.EnsureCreated();

            return context;
        }
    }
    public class Node
    {
        public int Id { get; set; }
        public string Name { get; set; } 
        public string Hostname { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
    }
    public class Command
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}