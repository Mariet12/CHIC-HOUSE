using Electro.Core.Dtos;
using Electro.Core.Models;
using Electro.Reposatory.Data.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Electro.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly AppIdentityDbContext _db;
        private readonly IWebHostEnvironment _env;

        public PortfolioController(AppIdentityDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // GET: api/portfolio
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PortfolioItemDto>>> GetAll(CancellationToken ct)
        {
            var items = await _db.PortfolioItems
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(ct); // materialize الأول

            var data = items.Select(x => new PortfolioItemDto(
                x.Id,
                x.Name,
                x.Description,
                ToAbsoluteUrl(x.ImageUrl),     // نخليها absolute
                x.CreatedAt,
                x.UpdatedAt
            )).ToList();

            return Ok(new { statusCode = 200, message = "all data", data });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PortfolioItemDto>> GetById(int id, CancellationToken ct)
        {
            var x = await _db.PortfolioItems
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id, ct);

            if (x is null) return NotFound();

            var dto = new PortfolioItemDto(
                x.Id,
                x.Name,
                x.Description,
                ToAbsoluteUrl(x.ImageUrl),
                x.CreatedAt,
                x.UpdatedAt
            );

            return Ok(new { statusCode = 200, message = "single item", data = dto });
        }


        // POST: api/portfolio  (يدعم multipart/form-data أو JSON)
        [HttpPost]
        public async Task<ActionResult<PortfolioItemDto>> Create([FromForm] CreatePortfolioItemDto dto, CancellationToken ct)
        {
            string? imagePath = null;

            if (dto.Image is not null && dto.Image.Length > 0)
            {
                imagePath = await SaveImageAsync(dto.Image, ct);
            }
           

            var entity = new PortfolioItem
            {
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = imagePath
            };

            _db.PortfolioItems.Add(entity);
            await _db.SaveChangesAsync(ct);

            var result = new PortfolioItemDto(entity.Id, entity.Name, entity.Description, ToAbsoluteUrl(entity.ImageUrl), entity.CreatedAt, entity.UpdatedAt);
            return Ok(new { statusCode = 200, message = "added", data = result });
        }

        // PUT: api/portfolio/5  (استبدال كامل — مع دعم nulls)
        [HttpPut("{id:int}")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<PortfolioItemDto>> Update(int id, [FromForm] UpdatePortfolioItemDto dto, CancellationToken ct)
        {
            var entity = await _db.PortfolioItems.FirstOrDefaultAsync(p => p.Id == id, ct);
            if (entity is null) return NotFound();

            // لو فيه ملف مرسل، ارفعه وبدّل الرابط
            if (dto.Image is not null && dto.Image.Length > 0)
            {
                entity.ImageUrl = await SaveImageAsync(dto.Image, ct);
            }
            else
            {
                // حتى لو null بنسمح بتفريغ القيمة
                if (dto.ImageUrl is not null) entity.ImageUrl = dto.ImageUrl;
            }

            // الحقول Nullable — لو حضرَت بنحدّثها حتى لو null
            if (dto.Name is not null) entity.Name = dto.Name;
            if (dto.Description is not null) entity.Description = dto.Description;

            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            var result = new PortfolioItemDto(entity.Id, entity.Name, entity.Description, ToAbsoluteUrl(entity.ImageUrl), entity.CreatedAt, entity.UpdatedAt);
            return Ok(new { statusCode = 200, message = "updated", data = result });
        }

       

        // DELETE: api/portfolio/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var entity = await _db.PortfolioItems.FirstOrDefaultAsync(p => p.Id == id, ct);
            if (entity is null) return NotFound();

            _db.PortfolioItems.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // Helpers
        private async Task<string> SaveImageAsync(IFormFile file, CancellationToken ct)
        {
            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "portfolio");
            Directory.CreateDirectory(uploadsRoot);

            var safeName = Path.GetFileNameWithoutExtension(Path.GetRandomFileName());
            var ext = Path.GetExtension(file.FileName); // فكّر تتحقق من الامتداد
            var finalName = $"{safeName}{ext}";
            var fullPath = Path.Combine(uploadsRoot, finalName);

            using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream, ct);
            }

            // بنخزّن مسار relative يخدمه StaticFiles
            var relative = $"/uploads/portfolio/{finalName}";
            return relative;
        }

        private string? ToAbsoluteUrl(string? maybeRelative)
        {
            if (string.IsNullOrWhiteSpace(maybeRelative)) return null;
            if (Uri.TryCreate(maybeRelative, UriKind.Absolute, out _)) return maybeRelative;

            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return $"{baseUrl}{maybeRelative}";
        }
    }
}
