using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CFWS.MoeNitro.Label.Model
{
    public class RequestModel
    {
        public string Host { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Command { get; set; }
    }
}
