using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Electro.Core.Dtos.Account
{
    public class Register
    {
        [Required(ErrorMessage = "UserName is required")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string Role { get; set; } = "Customer";

        /// <summary>صورة الملف الشخصي - اختيارية (لا تُطلب عند التسجيل).</summary>
        public IFormFile? Image { get; set; }
    }
}
