using eBook.Core.Interface;
using eBook.Services;
using Electro.Core.Interface;
using Electro.Core.Models.Identity;
using Electro.Core.Services;
using Electro.Reposatory.Data.Identity;
using Electro.Service;
using Electro.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Electro.Apis.Extentions
{
    public static class IdentityServicesExtentions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
        {
            // ===== DbContext =====
            services.AddDbContext<AppIdentityDbContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("IdentityConnections"));
            });

            // ===== Identity =====
            services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.User.AllowedUserNameCharacters = null;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;

                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 0;
            })
            .AddEntityFrameworkStores<AppIdentityDbContext>()
            .AddDefaultTokenProviders()
            .AddRoles<IdentityRole>();

            // ===== Auth (JWT) =====
            var issuer = configuration["JWT:ValidIssuer"];
            var audience = configuration["JWT:ValidAudience"];
            var key = configuration["JWT:Key"]; // Key بحرف K كبير

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),

                    // 👇 مهم جداً علشان استرجاع اليوزرId من "sub"
                    NameClaimType = "sub",
                    RoleClaimType = "role" // لو بتستخدم "roles" غيّرها هنا
                };

                // قراءة التوكن من query عند /hubs/support (لو عندك هب بهذا المسار)
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = ctx =>
                    {
                        if (ctx.Request.Path.StartsWithSegments("/hubs/support") &&
                            ctx.Request.Query.TryGetValue("access_token", out var token))
                        {
                            ctx.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
            });

            // ===== CORS (سياسة مسماة) =====
            services.AddCors(options =>
            {
                var origins = configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
                options.AddPolicy("FrontCors", builder =>
                    builder.SetIsOriginAllowed(origin =>
                    {
                        // السماح بالـ origins المحددة في appsettings.json
                        if (origins.Contains(origin))
                            return true;
                        
                        // السماح بكل الـ Vercel preview deployments (*.vercel.app)
                        if (origin.EndsWith(".vercel.app"))
                            return true;
                        
                        return false;
                    })
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials());
            });

            // ===== DI (تسجيل الخدمات مرة واحدة فقط) =====
            services.AddHttpClient();
            services.AddHttpContextAccessor();

            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IOtpService, OtpService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IFavoriteService, FavoriteService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IAdminDashboardService, AdminDashboardService>();
            services.AddScoped<IPromotionService, PromotionService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IFirebaseProvider, FirebaseProvider>();
            services.AddScoped<ICommunicationMethodsService, CommunicationMethodsService>();
            services.AddScoped<IContactService, ContactService>();

            // ===== Request size limits =====
            services.Configure<IISServerOptions>(o => o.MaxRequestBodySize = 102_428_800);
            services.Configure<KestrelServerOptions>(o => o.Limits.MaxRequestBodySize = 102_428_800);

            return services;
        }
    }
}
