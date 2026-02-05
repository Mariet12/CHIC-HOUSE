using Electro.Core.Dtos.Account;
using Electro.Core.Errors;
using Electro.Core.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;
using System.IO;
using System;
using System.Linq;

namespace Electro.Apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IAccountService accountService, ILogger<AccountController> logger)
        {
            _accountService = accountService;
            _logger = logger;
        }

        [HttpGet("user-info")]
        [Authorize]
        public async Task<IActionResult> GetUserInfo()
        {
            try
            {
                var result = await _accountService.GetUserInfoAsync();
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user info");
                return StatusCode(500, CreateErrorResponse("An unexpected error occurred"));
            }
        }

        /// <summary>تسجيل حساب جديد عبر JSON (موصى به - لا يعتمد على FormData).</summary>
        [HttpPost("register-json")]
        public async Task<IActionResult> RegisterJson([FromBody] RegisterDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { statusCode = 400, message = "بيانات التسجيل مطلوبة" });
            }

            var model = new Register
            {
                UserName = dto.UserName?.Trim() ?? "",
                Email = dto.Email?.Trim() ?? "",
                Password = dto.Password ?? "",
                PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim(),
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "Customer" : dto.Role.Trim(),
                Image = null
            };

            if (string.IsNullOrWhiteSpace(model.UserName))
            {
                return BadRequest(new { statusCode = 400, message = "اسم المستخدم مطلوب", errors = new[] { "UserName is required" } });
            }
            if (string.IsNullOrWhiteSpace(model.Email))
            {
                return BadRequest(new { statusCode = 400, message = "البريد الإلكتروني مطلوب", errors = new[] { "Email is required" } });
            }
            if (!model.Email.Contains("@") || model.Email.Length < 5)
            {
                return BadRequest(new { statusCode = 400, message = "تنسيق البريد الإلكتروني غير صحيح", errors = new[] { "Invalid email format" } });
            }
            if (string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { statusCode = 400, message = "كلمة المرور مطلوبة", errors = new[] { "Password is required" } });
            }
            if (model.Password.Length < 6)
            {
                return BadRequest(new { statusCode = 400, message = "كلمة المرور يجب أن تكون 6 أحرف على الأقل", errors = new[] { "Password must be at least 6 characters" } });
            }

            try
            {
                var result = await _accountService.RegisterAsync(model);
                _logger.LogInformation("Registration result: {StatusCode}, {Message}", result.StatusCode, result.Message);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", model.Email);
                return StatusCode(500, CreateErrorResponse("Registration failed"));
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] Register model)
        {
            _logger.LogInformation("Registration attempt for email: {Email}, UserName: {UserName}", 
                model?.Email, model?.UserName);

            if (model == null)
            {
                return BadRequest(new { statusCode = 400, message = "Registration data is required" });
            }

            // تجاهل ModelState والاعتماد على التحقق اليدوي فقط (لتجنب أخطاء الربط مع FormData)
            model.Role = string.IsNullOrWhiteSpace(model.Role) ? "Customer" : model.Role.Trim();
            model.PhoneNumber = string.IsNullOrWhiteSpace(model.PhoneNumber) ? null : model.PhoneNumber.Trim();
            model.Image = null; // الصورة غير مطلوبة عند التسجيل

            // التحقق من الحقول المطلوبة فقط
            if (string.IsNullOrWhiteSpace(model.UserName))
            {
                return BadRequest(new { statusCode = 400, message = "اسم المستخدم مطلوب", errors = new[] { "UserName is required" } });
            }
            model.UserName = model.UserName.Trim();

            if (string.IsNullOrWhiteSpace(model.Email))
            {
                return BadRequest(new { statusCode = 400, message = "البريد الإلكتروني مطلوب", errors = new[] { "Email is required" } });
            }
            model.Email = model.Email.Trim();
            if (!model.Email.Contains("@") || model.Email.Length < 5)
            {
                return BadRequest(new { statusCode = 400, message = "تنسيق البريد الإلكتروني غير صحيح", errors = new[] { "Invalid email format" } });
            }

            if (string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { statusCode = 400, message = "كلمة المرور مطلوبة", errors = new[] { "Password is required" } });
            }
            if (model.Password.Length < 6)
            {
                return BadRequest(new { statusCode = 400, message = "كلمة المرور يجب أن تكون 6 أحرف على الأقل", errors = new[] { "Password must be at least 6 characters" } });
            }

            try
            {
                var result = await _accountService.RegisterAsync(model);
                _logger.LogInformation("Registration result: StatusCode={StatusCode}, Message={Message}", 
                    result.StatusCode, result.Message);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", model?.Email);
                return StatusCode(500, CreateErrorResponse("Registration failed"));
            }
        }

        /// <summary>
        /// إنشاء حساب أدمن (للاستخدام الأول أو السكربتات). لا يتطلب تسجيل دخول.
        /// </summary>
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.UserName))
            {
                return BadRequest(CreateErrorResponse("Email, UserName and Password are required."));
            }
            if (request.Password.Length < 6)
            {
                return BadRequest(CreateErrorResponse("Password must be at least 6 characters."));
            }
            try
            {
                var result = await _accountService.CreateAdminAsync(request.Email.Trim(), request.Password, request.UserName.Trim());
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateAdmin failed for email: {Email}", request.Email);
                return StatusCode(500, CreateErrorResponse("Failed to create admin."));
            }
        }

        /// <summary>
        /// تحويل مستخدم موجود (كيزر) إلى أدمن بالإيميل. للأدمن فقط.
        /// </summary>
        [HttpPost("upgrade-to-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpgradeToAdmin([FromBody] UpgradeToAdminRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(CreateErrorResponse("Email is required."));
            }
            try
            {
                var result = await _accountService.UpgradeUserToAdminAsync(request.Email.Trim());
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpgradeToAdmin failed for email: {Email}", request.Email);
                return StatusCode(500, CreateErrorResponse("Failed to upgrade user to admin."));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.LoginAsync(dto);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("Login failed"));
            }
        }

        //[HttpPost("verify-email")]
        //public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        //{
        //    if (!ModelState.IsValid)
        //        return BadRequest(CreateValidationErrorResponse());

        //    try
        //    {
        //        var result = await _accountService.VerifyEmailOtpAsync(dto);
        //        return StatusCode(result.StatusCode, CreateResponse(result));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error verifying email: {Email}", dto.Email);
        //        return StatusCode(500, CreateErrorResponse("Email verification failed"));
        //    }
        //}
        //[HttpPost("resend-otp")]
        //public async Task<IActionResult> ResendOtp([FromQuery][EmailAddress] string email)
        //{
        //    var result = await _accountService.ResendEmailOtpAsync(email);
        //    return StatusCode(result.StatusCode, new
        //    {
        //        statusCode = result.StatusCode,
        //        message = result.Message
        //    });
        //}

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.ForgotPasswordAsync(dto.Email);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in forgot password for email: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("Password reset failed"));
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtp dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.VerifyOtpAsync(dto);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying OTP for email: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("OTP verification failed"));
            }
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPassword dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.ResetPasswordAsync(dto);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("Password reset failed"));
            }
        }

        [HttpPut("update-user")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromForm] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.UpdateUserAsync(dto);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return StatusCode(500, CreateErrorResponse("User update failed"));
            }
        }

        [HttpDelete("delete-image")]
        [Authorize]
        public async Task<IActionResult> DeleteUserImage()
        {
            try
            {
                var result = await _accountService.DeleteUserImageAsync();
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user image");
                return StatusCode(500, CreateErrorResponse("Image deletion failed"));
            }
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.ChangePasswordAsync(dto);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, CreateErrorResponse("Password change failed"));
            }
        }

        [HttpGet("all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _accountService.GetAllUsersAsync();
                return Ok(new
                {
                    statusCode = 200,
                    message = "Users retrieved successfully",
                    data = users
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                return StatusCode(500, CreateErrorResponse("Failed to retrieve users"));
            }
        }
        [HttpPost("delete")]
        public async Task<IActionResult> SoftDeleteUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized(new ApiResponse(401, "Unauthorized")); 
            var result = await _accountService.SoftDeleteProfileAsync(userId);
            return StatusCode(result.StatusCode, CreateResponse(result));
        }

       
        // Helper methods
        private object CreateResponse(ApiResponse result)
        {
            var response = new
            {
                statusCode = result.StatusCode,
                message = result.Message
            };

            if (result.Data != null)
            {
                return new
                {
                    statusCode = result.StatusCode,
                    message = result.Message,
                    data = result.Data
                };
            }

            return response;
        }

        private object CreateErrorResponse(string message)
        {
            return new
            {
                statusCode = 500,
                message = message
            };
        }

        private object CreateValidationErrorResponse()
        {
            return new
            {
                statusCode = 400,
                message = "Validation failed",
                errors = ModelState.SelectMany(x => x.Value?.Errors ?? Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.ModelError>())
                                  .Select(x => x.ErrorMessage)
                                  .ToList()
            };
        }
    }

    // DTO for forgot password
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class CreateAdminRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }

    public class UpgradeToAdminRequest
    {
        [System.Text.Json.Serialization.JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
    }
}