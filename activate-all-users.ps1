# Script to activate all users (set EmailConfirmed = true and Status = Active)
# Usage: .\activate-all-users.ps1

$apiUrl = "http://localhost:5008/api/Account/activate-all-users"

Write-Host "Activating all users..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json"
    
    Write-Host "✅ Users activated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "❌ Error activating users:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Trying production URL..." -ForegroundColor Yellow
    try {
        $apiUrl = "https://chic-house.runasp.net/api/Account/activate-all-users"
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json"
        Write-Host "✅ Users activated successfully on production!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5
    }
    catch {
        Write-Host "❌ Production also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
