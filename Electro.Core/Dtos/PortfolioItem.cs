using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Electro.Core.Dtos
{
    public sealed record PortfolioItemDto(
    int Id,
    string? Name,
    string? Description,
    string? ImageUrl,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

    public sealed class CreatePortfolioItemDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }

        // واحد منهم فقط اختياري:
        public IFormFile? Image { get; set; }  // لو هترفع ملف
    }

    public sealed class UpdatePortfolioItemDto
    {
        public string? Name { get; set; }         // لو بعتها null هنعتبرك عايز تفضيها
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }     // overwrite للمسار/الرابط
        public IFormFile? Image { get; set; }     // لو بعتها هنرفعها ونستبدل ImageUrl
    }
}
