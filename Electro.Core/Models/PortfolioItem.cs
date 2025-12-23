using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Electro.Core.Models
{
    // Models/PortfolioItem.cs
    public class PortfolioItem
    {
        public int Id { get; set; }
        public string? Name { get; set; }           // nullable
        public string? Description { get; set; }    // nullable
        public string? ImageUrl { get; set; }       // nullable (مسار أو رابط)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

}
