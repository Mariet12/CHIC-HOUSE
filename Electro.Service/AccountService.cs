
using Electro.Core.Dtos;
using Electro.Core.Dtos.Account;
using Electro.Core.Errors;
using Electro.Core.Interface;
using Electro.Core.Models.Identity;
using Electro.Core.Services;
using Electro.Reposatory.Data.Identity;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Security.Claims;
using System.Text.Json;
using System.IO;

namespace Electro.Service
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly MailSettings _mailSettings;
        private readonly ITokenService _tokenService;
        private readonly IOtpService _otpService;
        private readonly IMemoryCache _cache;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AccountService> _logger;
        private readonly IFileService _fileService;
        private readonly AppIdentityDbContext _context;

        public AccountService(
            UserManager<AppUser> userManager,
            IOptionsMonitor<MailSettings> mailSettings,
            ITokenService tokenService,
            IOtpService otpService,
            IMemoryCache cache,
            SignInManager<AppUser> signInManager,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AccountService> logger,
            IFileService fileService,AppIdentityDbContext context)
        {
            _userManager = userManager;
            _mailSettings = mailSettings.CurrentValue;
            _tokenService = tokenService;
            _otpService = otpService;
            _context = context;
            _cache = cache;
            _signInManager = signInManager;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _fileService = fileService;
        }

        public async Task<ApiResponse> RegisterAsync(Register dto)
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return new ApiResponse(400, "User with this email already exists");

            // Handle image upload if provided
            string? imageUrl = null;
            if (dto.Image != null)
            {
                imageUrl = await _fileService.SaveFileAsync(dto.Image, "users");
            }

            // Create user
            var user = new AppUser
            {
                FullName = dto.UserName,
                UserName = dto.Email,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                EmailConfirmed = true,
                Role = dto.Role,
                Image = imageUrl,
                Status = UserStatus.Active,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" | ", result.Errors.Select(e => e.Description));
                return new ApiResponse(400, $"Registration failed: {errors}");
            }

            // Assign role
            await _userManager.AddToRoleAsync(user, dto.Role);

            return new ApiResponse(200, "Registration successful")
            {
                Data = new { user.Id, user.Email, user.UserName, user.Status }
            };
        }
        public async Task<ApiResponse> LoginAsync(Login dto)
        {
            // #region agent log
            try { var log1 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_1", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:100", message = "LoginAsync entry", data = new { email = dto?.Email ?? "null", passwordLength = dto?.Password?.Length ?? 0, hasFcmToken = !string.IsNullOrEmpty(dto?.FcmToken) }, sessionId = "debug-session", runId = "run1", hypothesisId = "E" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log1) + "\n"); } catch { }
            // #endregion

            if (dto == null || string.IsNullOrEmpty(dto.Email))
            {
                return new ApiResponse(400, "Email is required");
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            
            // #region agent log
            try { var log2 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_2", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:105", message = "After FindByEmailAsync", data = new { userFound = user != null, userId = user?.Id, userEmail = user?.Email, emailConfirmed = user?.EmailConfirmed, userStatus = user?.Status.ToString() }, sessionId = "debug-session", runId = "run1", hypothesisId = "A" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log2) + "\n"); } catch { }
            // #endregion

            if (user == null)
            {
                // #region agent log
                try { var log3 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_3", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:108", message = "User not found - returning 401", data = new { searchedEmail = dto.Email }, sessionId = "debug-session", runId = "run1", hypothesisId = "A" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log3) + "\n"); } catch { }
                // #endregion
                return new ApiResponse(401, "This email is not registered.");
            }

            var passwordCheck = await _userManager.CheckPasswordAsync(user, dto.Password);
            
            // #region agent log
            try { var log4 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_4", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:115", message = "After CheckPasswordAsync", data = new { passwordValid = passwordCheck, userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "B" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log4) + "\n"); } catch { }
            // #endregion

            if (!passwordCheck)
            {
                // #region agent log
                try { var log5 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_5", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:118", message = "Password incorrect - returning 401", data = new { userId = user.Id, email = user.Email }, sessionId = "debug-session", runId = "run1", hypothesisId = "B" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log5) + "\n"); } catch { }
                // #endregion
                return new ApiResponse(401, "Incorrect password. Please try again.");
            }

            // #region agent log
            try { var log6 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_6", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:123", message = "Checking EmailConfirmed", data = new { emailConfirmed = user.EmailConfirmed, userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "C" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log6) + "\n"); } catch { }
            // #endregion

            if (!user.EmailConfirmed)
            {
                // #region agent log
                try { var log7 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_7", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:126", message = "Email not confirmed - returning 403", data = new { userId = user.Id, email = user.Email }, sessionId = "debug-session", runId = "run1", hypothesisId = "C" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log7) + "\n"); } catch { }
                // #endregion
                return new ApiResponse(403, "Email not verified. Please check your inbox.");
            }

            // Check user status
            // #region agent log
            try { var log8 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_8", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:133", message = "Checking user status", data = new { status = user.Status.ToString(), userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log8) + "\n"); } catch { }
            // #endregion

            switch (user.Status)
            {
                case UserStatus.Banned: 
                    // #region agent log
                    try { var log9 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_9", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:137", message = "User banned - returning 403", data = new { userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log9) + "\n"); } catch { }
                    // #endregion
                    return new ApiResponse(403, "Your account has been banned.");
                case UserStatus.Rejected: 
                    // #region agent log
                    try { var log10 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_10", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:140", message = "User rejected - returning 403", data = new { userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log10) + "\n"); } catch { }
                    // #endregion
                    return new ApiResponse(403, "Your account has been rejected.");
                case UserStatus.Inactive: 
                    // #region agent log
                    try { var log11 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_11", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:143", message = "User inactive - returning 403", data = new { userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log11) + "\n"); } catch { }
                    // #endregion
                    return new ApiResponse(403, "Your account is inactive. Please contact support.");
                case UserStatus.Deleted: 
                    // #region agent log
                    try { var log12 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_12", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:146", message = "User deleted - returning 403", data = new { userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log12) + "\n"); } catch { }
                    // #endregion
                    return new ApiResponse(403, "Your account has been deleted.");
                case UserStatus.Active: break;
                default: 
                    // #region agent log
                    try { var log13 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_13", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:150", message = "Invalid status - returning 403", data = new { status = user.Status.ToString(), userId = user.Id }, sessionId = "debug-session", runId = "run1", hypothesisId = "D" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log13) + "\n"); } catch { }
                    // #endregion
                    return new ApiResponse(403, "Your account status is not valid for login.");
            }

            // ✨ لو جالك FcmToken في DTO، خزّنه في الجدول
            if (!string.IsNullOrEmpty(dto.FcmToken))
            {
                await _userManager.UpdateAsync(user);
            }

            var token = await _tokenService.CreateTokenAsync(user);
            
            // #region agent log
            try { var log14 = new { id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_14", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), location = "AccountService.cs:162", message = "Login successful", data = new { userId = user.Id, email = user.Email, tokenGenerated = !string.IsNullOrEmpty(token) }, sessionId = "debug-session", runId = "run1", hypothesisId = "SUCCESS" }; File.AppendAllText(@"c:\Users\marie\Desktop\HAND MADE\.cursor\debug.log", JsonSerializer.Serialize(log14) + "\n"); } catch { }
            // #endregion

            return new ApiResponse(200, "Login successful")
            {
                Data = new
                {
                    userId = user.Id,
                    email = user.Email,
                    token = token,
                    role = user.Role,
                    status = user.Status.ToString(),
                    user = new
                    {
                        user.UserName,
                        user.PhoneNumber,
                        user.Image
                    }
                }
            };
        }

        public async Task<ApiResponse> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal if user exists or not for security
                return new ApiResponse(200, "If the email exists, a reset code has been sent");
            }

            var otp = _otpService.GenerateOtp(email);

            try
            {
                await SendEmailAsync(email, "Password Reset Code",
                    CreatePasswordResetEmailBody(user.UserName ?? "", otp));

                return new ApiResponse(200, "Password reset code sent to your email");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
                return new ApiResponse(500, "Failed to send reset email");
            }
        }

        public Task<ApiResponse> VerifyOtpAsync(VerifyOtp dto)
        {
            var isValid = _otpService.IsValidOtp(dto.Email, dto.Otp);
            if (!isValid)
            {
                return Task.FromResult(new ApiResponse(400, "Invalid or expired OTP"));
            }

            // Mark OTP as verified for password reset
            _cache.Set($"otp_verified_{dto.Email}", true, TimeSpan.FromMinutes(10));

            return Task.FromResult(new ApiResponse(200, "OTP verified successfully"));
        }

        public async Task<ApiResponse> VerifyEmailOtpAsync(VerifyEmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return new ApiResponse(404, "User not found");

            if (!_cache.TryGetValue(dto.Email, out string? savedOtp) || savedOtp == null)
                return new ApiResponse(400, "OTP has expired");

            if (dto.OtpCode != savedOtp)
                return new ApiResponse(400, "Invalid OTP code");

            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);

            // Clean up cache
            _cache.Remove(dto.Email);

            return new ApiResponse(200, "Email verified successfully");
        }
        public async Task<ApiResponse> ResendEmailOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new ApiResponse(404, "User not found.");

            if (user.EmailConfirmed)
                return new ApiResponse(400, "Email is already verified.");

            var otp = _otpService.GenerateOtp(email);
            _cache.Set(email, otp, TimeSpan.FromMinutes(10)); // كاش لمدة 10 دقائق

            var emailBody = $@"
        <p>Dear {user.UserName},</p>
        <p>Please use the following OTP to verify your email:</p>
        <h2 style='color:blue'>{otp}</h2>";

            await SendEmailAsync(email, "Resend OTP - Email Verification", emailBody);

            return new ApiResponse(200, "A new OTP has been sent to your email.");
        }


        public async Task<ApiResponse> ResetPasswordAsync(ResetPassword dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return new ApiResponse(400, "User not found");
            }

            // Check if OTP was verified
            if (!_cache.TryGetValue($"otp_verified_{dto.Email}", out bool verified) || !verified)
            {
                return new ApiResponse(400, "Please verify your OTP first");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.Password);

            if (result.Succeeded)
            {
                // Clean up verification cache
                _cache.Remove($"otp_verified_{dto.Email}");
                return new ApiResponse(200, "Password reset successfully");
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Password reset failed: {errors}");
        }

        public async Task<ApiResponse> UpdateUserAsync(UpdateUserDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            // Update user properties
            if (!string.IsNullOrEmpty(dto.UserName))
                user.UserName = dto.UserName;
            if (!string.IsNullOrEmpty(dto.Address))
                user.Address = dto.Address;
            if (!string.IsNullOrEmpty(dto.City))
                user.City = dto.City;

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            // Handle image update
            if (dto.Image != null)
            {
                // Delete old image if exists
                if (!string.IsNullOrEmpty(user.Image))
                {
                    await _fileService.DeleteFileAsync(user.Image);
                }
                // Save new image
                user.Image = await _fileService.SaveFileAsync(dto.Image, "users");
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return new ApiResponse(200, "User updated successfully", new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.PhoneNumber,
                    user.Image,
                    user.Status,
                    
                });
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Update failed: {errors}");
        }
        public async Task<ApiResponse> DeleteUserImageAsync()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            if (string.IsNullOrEmpty(user.Image))
            {
                return new ApiResponse(404, "No image to delete");
            }

            // Delete image file
            await _fileService.DeleteFileAsync(user.Image);

            // Update user record
            user.Image = null;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return new ApiResponse(200, "Image deleted successfully");
            }

            return new ApiResponse(400, "Failed to delete image");
        }

        public async Task<ApiResponse> ChangePasswordAsync(ChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (result.Succeeded)
            {
                return new ApiResponse(200, "Password changed successfully");
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Password change failed: {errors}");
        }

        public async Task<ApiResponse> GetUserInfoAsync()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            var roles = await _userManager.GetRolesAsync(user);
            return new ApiResponse(200, "User info retrieved successfully", new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.PhoneNumber,
               
                user.Image,
                user.EmailConfirmed,
                Role = user.Role,
                user.Status,
               
            });
        }

        // Updated GetAllUsersAsync method
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id ?? "",
                    UserName = user.UserName ?? "",
                    Email = user.Email ?? "",
                    PhoneNumber = user.PhoneNumber ?? "",
                    Image = user.Image ?? "",
                    EmailConfirmed = user.EmailConfirmed,
                    Role = roles.FirstOrDefault() ?? "Customer",
                    Status = user.Status,
                    
                });
            }

            return userDtos;
        }
        // Private helper methods
        private string? GetCurrentUserId()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        
        private async Task<ApiResponse> GenerateAndSendEmailOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new ApiResponse(404, "User not found");

            var otp = _otpService.GenerateOtp(email);
            _cache.Set(email, otp, TimeSpan.FromMinutes(10));

            try
            {
                await SendEmailAsync(email, "Email Verification",
                    CreateVerificationEmailBody(user.UserName ?? "", otp));

                return new ApiResponse(200, "OTP sent successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", email);
                return new ApiResponse(500, "Failed to send verification email");
            }
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_mailSettings.DisplayedName, _mailSettings.Email));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using var client = new MailKit.Net.Smtp.SmtpClient();

            try
            {
                await client.ConnectAsync(_mailSettings.SmtpServer, _mailSettings.Port, SecureSocketOptions.StartTls);

                await client.AuthenticateAsync(_mailSettings.Email, _mailSettings.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP error sending email to {Email}", to);
                throw;
            }
        }

        private string CreateVerificationEmailBody(string userName, string otp)
        {
            return $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2>Email Verification</h2>
                    <p>Dear {userName},</p>
                    <p>Please use the following OTP to verify your email address:</p>
                    <div style='background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #007bff; font-size: 32px; margin: 0;'>{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </div>";
        }

        private string CreatePasswordResetEmailBody(string userName, string otp)
        {
            return $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2>Password Reset</h2>
                    <p>Dear {userName},</p>
                    <p>Use this code to reset your password:</p>
                    <div style='background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #dc3545; font-size: 32px; margin: 0;'>{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                </div>";
        }



        // New method for admin to update user status
        public async Task<ApiResponse> UpdateUserStatusAsync(string userId, UserStatus status)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            if (currentUser == null || currentUser.Role.ToLower() != "admin")
            {
                return new ApiResponse(403, "Access denied. Admin rights required.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            if (status == UserStatus.Rejected)
            {
                var deleteResult = await _userManager.DeleteAsync(user);
                if (deleteResult.Succeeded)
                {
                    return new ApiResponse(200, "User rejected and deleted successfully");
                }

                var deleteErrors = string.Join(", ", deleteResult.Errors.Select(e => e.Description));
                return new ApiResponse(400, $"User deletion failed: {deleteErrors}");
            }

            user.Status = status;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return new ApiResponse(200, "User status updated successfully", new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Status = user.Status.ToString()
                });
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Status update failed: {errors}");
        }

        // New method to get users by status (for admin)
        public async Task<ApiResponse> GetUsersByStatusAsync(UserStatus? status = null)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            if (currentUser == null || currentUser.Role.ToLower() != "admin")
            {
                return new ApiResponse(403, "Access denied. Admin rights required.");
            }

            var query = _userManager.Users.AsQueryable();
            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            var users = await query.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id ?? "",
                    UserName = user.UserName ?? "",
                    Email = user.Email ?? "",
                    PhoneNumber = user.PhoneNumber ?? "",
                   
                    Image = user.Image ?? "",
                    EmailConfirmed = user.EmailConfirmed,
                    Role = roles.FirstOrDefault() ?? "User",
                    Status = user.Status,
                   
                });
            }

            return new ApiResponse(200, "Users retrieved successfully", userDtos);
        }
        public async Task<ApiResponse> SoftDeleteUserAsync(string userId)
        {
            var currentUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                return new ApiResponse(401, "User not authenticated");
            }

            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            if (currentUser == null || currentUser.Role.ToLower() != "admin")
            {
                return new ApiResponse(403, "Access denied. Admin rights required.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            // Perform soft delete by setting status
            user.Status = UserStatus.Deleted;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return new ApiResponse(200, "User soft-deleted successfully", new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Status = user.Status.ToString()
                });
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Soft delete failed: {errors}");
        }
  
        public async Task<PaginatedResult<UserDto>> GetCustomerAsync(FilterDto filter)
        {
            var query = _userManager.Users
                .Where(u => u.Role == "Customer");

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search;
                query = query.Where(u =>
                    (u.UserName != null && u.UserName.Contains(search)) ||
                    (u.Email != null && u.Email.Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(u => u.UserName)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id ?? "",
                    UserName = u.UserName ?? "",
                    Email = u.Email ?? "",
                    PhoneNumber = u.PhoneNumber ?? "",
                    Image = u.Image ?? "",
                    Status = u.Status,
                    Role = u.Role ?? "",
                    EmailConfirmed = u.EmailConfirmed,
                    
                    
                })
                .ToListAsync();

            return new PaginatedResult<UserDto>
            {
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                Items = items
            };
        }

        public async Task<ApiResponse> SoftDeleteProfileAsync(string userId)
        {
          
           
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ApiResponse(404, "User not found");
            }

            // Perform soft delete by setting status
            user.Status = UserStatus.Deleted;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return new ApiResponse(200, "User soft-deleted successfully", new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Status = user.Status.ToString()
                });
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new ApiResponse(400, $"Soft delete failed: {errors}");
        }

    }
}



