﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CFWS.MoeNitro.Label.Model;
using Renci.SshNet;
using Microsoft.Extensions.Configuration;
using CFWS.MoeNitro.Label.Database;

namespace CFWS.MoeNitro.Label.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public JsonResult Req(RequestModel input)
        {
            SshCommand command = null;
            try
            {
                AuthenticationMethod auth = new PasswordAuthenticationMethod(input.Username, input.Password);
                ConnectionInfo connectionInfo = new ConnectionInfo(input.Host, input.Username, auth);

                using (var ssh = new SshClient(connectionInfo))
                {
                    ssh.Connect();
                    command = ssh.CreateCommand(input.Command);
                    command.Execute();
                    ssh.Disconnect();
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    error = ex.Message,
                    data = ""
                });
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
