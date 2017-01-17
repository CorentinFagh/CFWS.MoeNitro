using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CFWS.MoeNitro.Label.Model;
using Renci.SshNet;

namespace CFWS.MoeNitro.Label.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        public JsonResult Req(RequestModel input)
        {           
            AuthenticationMethod auth = new PasswordAuthenticationMethod(input.Username, input.Password);
            ConnectionInfo connectionInfo = new ConnectionInfo(input.Host, input.Username, auth);

            SshCommand command = null;
            using (var ssh = new SshClient(connectionInfo))
            {
                ssh.Connect();
                command = ssh.CreateCommand(input.Command);
                command.Execute();
                ssh.Disconnect();
            }
            
            return Json(new
            {
                success = command.ExitStatus== 0,
                data = command.Result,
                error = command.Error
            });
        }

    }
}
