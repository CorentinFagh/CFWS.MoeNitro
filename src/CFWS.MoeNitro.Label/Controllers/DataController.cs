using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CFWS.MoeNitro.Label.Database;

namespace CFWS.MoeNitro.Label.Controllers
{
    public class DataController : Controller
    {
        public ActionResult GetNodes()
        {
            IEnumerable<Node> result = null;
            try
            {
                using (var context = MoeNitorContextFactory.Create())
                {
                    result = context.Nodes.ToList();
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, data = ex.Message });

            }
            return Json(new {
                success = true,
                data = result
            });
        }
        public ActionResult AddNode(Node model)
        {
            try
            {
                using (var context = MoeNitorContextFactory.Create())
                {
                    context.Nodes.Add(model);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, data = ex.Message });

            }
            return Json(new { success = true });
        }
        public ActionResult RemoveNode(int id)
        {
            try
            {
                using (var context = MoeNitorContextFactory.Create())
                {
                    var toRemove = context.Nodes.FirstOrDefault(e => e.Id == id);
                    context.Nodes.Remove(toRemove);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, data = ex.Message});

            }
            return Json(new { success = true });
        }
    }
}
