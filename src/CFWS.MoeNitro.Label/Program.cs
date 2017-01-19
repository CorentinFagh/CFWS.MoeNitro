using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using CFWS.MoeNitro.Label.Database;

namespace CFWS.MoeNitro.Label
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Add connection string
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
            MoeNitorContextFactory.ConnectionString = builder.Build().GetConnectionString("SampleConnection");

            // Start server
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
