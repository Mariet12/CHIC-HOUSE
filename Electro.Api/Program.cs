using System.Text.Json.Serialization;
using Electro.Apis.Extentions;
using Electro.Core.Errors;
using Electro.Core.Interface;
using Electro.Service;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);
try
{
    string pathToCredentials = Path.Combine(Environment.CurrentDirectory, "wwwroot", "elctro-ed5d4-firebase-adminsdk-fbsvc-1680ef9784.json");
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromFile(pathToCredentials),
    });
}
catch (Exception ex)
{
    Console.WriteLine("Error initializing Firebase: " + ex.Message);
    throw; // لإظهار تفاصيل الخطأ في سجلات التطبيق
}
// ===== Controllers & JSON =====
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// ===== Response Caching =====
builder.Services.AddResponseCaching();

// ===== Identity + Auth + DB + App Services (كل التسجيلات الأساسية هنا) =====
// CORS مسجل بالفعل في AddIdentityServices
builder.Services.AddIdentityServices(builder.Configuration);

// ===== SignalR =====
builder.Services.AddSignalR()
    .AddJsonProtocol(o => o.PayloadSerializerOptions.PropertyNamingPolicy = null);

// ===== Swagger + بقية خدماتك =====
builder.Services.AddSwaggerService();
builder.Services.AddAplictionService();
builder.Services.AddMemoryCache();

// ===== لا تسجّل IFirebaseProvider/INotificationService هنا (مسجلين في AddIdentityServices) =====
// builder.Services.AddSingleton<IFirebaseProvider, FirebaseProvider>();
// builder.Services.AddScoped<INotificationService, NotificationService>();

// ===== دعم JWT في SignalR (لو مش متضاف في AddIdentityServices) =====
builder.Services.PostConfigureAll<JwtBearerOptions>(opts =>
{
    opts.Events ??= new JwtBearerEvents();
    var prev = opts.Events.OnMessageReceived;
    opts.Events.OnMessageReceived = ctx =>
    {
        // السماح للتوكن في QueryString عند مسارات SignalR (لو بتستخدم /hubs)
        var accessToken = ctx.Request.Query["access_token"];
        var path = ctx.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            ctx.Token = accessToken;
        return prev?.Invoke(ctx) ?? Task.CompletedTask;
    };
});

var app = builder.Build();

// ===== Errors =====
app.UseStatusCodePagesWithReExecute("/errors/{0}");
app.UseMiddleware<ExeptionMiddleWares>();

app.UseStaticFiles();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseRouting();

app.UseResponseCaching();

app.UseCors("FrontCors");

app.UseAuthentication();   // ✅ قبل Authorization
app.UseAuthorization();

// ===== SignalR Hubs =====
app.MapHub<ChatHub>("/ChatHub"); // لاحظ السلاش

// ===== REST Controllers =====
app.MapControllers();

app.Run();
