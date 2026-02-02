# Script to create admin account
# Usage: .\create-admin.ps1
# أو مع إيميل جديد: .\create-admin.ps1 -Email "your@email.com" -Password "YourPass123" -UserName "Your Name"
# أو السيرفر المباشر: .\create-admin.ps1 -UseProduction

param(
    [switch]$UseProduction,
    [string]$Email = "admin@chichouse.com",
    [string]$Password = "Admin@123456",
    [string]$UserName = "Admin User"
)

$apiUrl = if ($UseProduction) { "https://chic-house.runasp.net/api/Account/create-admin" } else { "http://localhost:5008/api/Account/create-admin" }

# Admin credentials - أو استخدم المعاملات من سطر الأوامر
$adminData = @{
    email = $Email
    password = $Password
    userName = $UserName
} | ConvertTo-Json

Write-Host "Creating admin account at: $apiUrl" -ForegroundColor Yellow
Write-Host "Email: $Email" -ForegroundColor Cyan
Write-Host "Password: $Password" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json; charset=utf-8" -Body $adminData
    
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
    
    Write-Host ""
    Write-Host "You can now login with:" -ForegroundColor Green
    Write-Host "Email: $Email" -ForegroundColor White
    Write-Host "Password: $Password" -ForegroundColor White
}
catch {
    Write-Host "❌ Error creating admin account:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red }
    if (-not $UseProduction) {
        Write-Host ""
        Write-Host "If API is on server, try: .\create-admin.ps1 -UseProduction" -ForegroundColor Yellow
    }
}
