using System.Text.Json.Serialization;

namespace Electro.Core.Dtos.Account
{
    /// <summary>لتسجيل حساب جديد عبر JSON (بدون صورة).</summary>
    public class RegisterDto
    {
        [JsonPropertyName("userName")]
        public string UserName { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        [JsonPropertyName("phoneNumber")]
        public string? PhoneNumber { get; set; }

        [JsonPropertyName("role")]
        public string? Role { get; set; }
    }
}
