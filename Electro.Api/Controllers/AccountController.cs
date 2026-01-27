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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] Register model)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Registration validation failed for email: {Email}. Errors: {Errors}", 
                    model?.Email ?? "unknown", 
                    string.Join(", ", ModelState.SelectMany(x => x.Value?.Errors ?? Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.ModelError>()).Select(x => x.ErrorMessage)));
                return BadRequest(CreateValidationErrorResponse());
            }

            try
            {
                var result = await _accountService.RegisterAsync(model);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", model?.Email ?? "unknown");
                return StatusCode(500, CreateErrorResponse("Registration failed"));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login dto)
        {
            // #region agent log
            try { var logCtrl1 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_ctrl1", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountController.cs:60", message = "Login endpoint entry", data = new { dtoEmail = dto?.Email ?? "null", dtoPasswordLength = dto?.Password?.Length ?? 0, modelStateValid = ModelState.IsValid, modelStateErrors = ModelState.SelectMany(x => x.Value?.Errors ?? Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.ModelError>()).Select(x => x.ErrorMessage).ToList() }, sessionId = "debug-session", runId = "run1", hypothesisId = "F" }; System.IO.File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(logCtrl1) + "\n"); } catch { }
            // #endregion

            if (!ModelState.IsValid)
            {
                // #region agent log
                try { var logCtrl2 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_ctrl2", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountController.cs:65", message = "ModelState invalid - returning 400", data = new { errors = ModelState.SelectMany(x => x.Value?.Errors ?? Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.ModelError>()).Select(x => x.ErrorMessage).ToList() }, sessionId = "debug-session", runId = "run1", hypothesisId = "F" }; System.IO.File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(logCtrl2) + "\n"); } catch { }
                // #endregion
                return BadRequest(CreateValidationErrorResponse());
            }

            try
            {
                if (dto == null)
                {
                    return BadRequest(CreateErrorResponse("Login data is required"));
                }
                var result = await _accountService.LoginAsync(dto);
                
                // #region agent log
                try { var logCtrl3 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_ctrl3", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountController.cs:75", message = "LoginAsync result", data = new { statusCode = result.StatusCode, message = result.Message }, sessionId = "debug-session", runId = "run1", hypothesisId = "RESULT" }; System.IO.File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(logCtrl3) + "\n"); } catch { }
                // #endregion

                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                // #region agent log
                try { var logCtrl4 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_ctrl4", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountController.cs:82", message = "Exception in Login", data = new { exceptionMessage = ex.Message, exceptionType = ex.GetType().Name }, sessionId = "debug-session", runId = "run1", hypothesisId = "EXCEPTION" }; System.IO.File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(logCtrl4) + "\n"); } catch { }
                // #endregion
                _logger.LogError(ex, "Error during login for email: {Email}", dto?.Email ?? "unknown");
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

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(CreateValidationErrorResponse());

            try
            {
                var result = await _accountService.CreateAdminAsync(dto.Email, dto.Password, dto.UserName);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin for email: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("Admin creation failed"));
            }
        }

        [HttpPost("activate-all-users")]
        public async Task<IActionResult> ActivateAllUsers()
        {
            try
            {
                var result = await _accountService.ActivateAllUsersAsync();
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating users");
                return StatusCode(500, CreateErrorResponse("Failed to activate users"));
            }
        }

        [HttpPost("activate-user")]
        public async Task<IActionResult> ActivateUser([FromBody] ActivateUserDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
                return BadRequest(CreateErrorResponse("Email is required"));

            try
            {
                var result = await _accountService.ActivateUserByEmailAsync(dto.Email);
                return StatusCode(result.StatusCode, CreateResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating user: {Email}", dto.Email);
                return StatusCode(500, CreateErrorResponse("Failed to activate user"));
            }
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

    // DTO for creating admin
    public class CreateAdminDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string UserName { get; set; } = string.Empty;
    }

    // DTO for activating user
    public class ActivateUserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}