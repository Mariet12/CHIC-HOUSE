# Script to create admin account
# Usage: .\create-admin.ps1

# Try localhost first, then production
$apiUrl = "http://localhost:5008/api/Account/create-admin"

# If localhost fails, try production
if (-not (Test-Path "http://localhost:5008")) {
    $apiUrl = "https://chic-house.runasp.net/api/Account/create-admin"
}

# Admin credentials
$adminData = @{
    email = "admin@chichouse.com"
    password = "Admin@123456"
    userName = "Admin User"
} | ConvertTo-Json

Write-Host "Creating admin account..." -ForegroundColor Yellow
Write-Host "Email: admin@chichouse.com" -ForegroundColor Cyan
Write-Host "Password: Admin@123456" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $adminData
    
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
    
    Write-Host ""
    Write-Host "You can now login with:" -ForegroundColor Green
    Write-Host "Email: admin@chichouse.com" -ForegroundColor White
    Write-Host "Password: Admin@123456" -ForegroundColor White
}
catch {
    Write-Host "❌ Error creating admin account:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
