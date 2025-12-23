# Script لرفع المشروع على GitHub
# استخدمي هذا الـ script بعد إنشاء Personal Access Token من GitHub

Write-Host "=== Chic House - GitHub Setup ===" -ForegroundColor Cyan
Write-Host ""

# طلب معلومات من المستخدم
$username = Read-Host "أدخلي GitHub username"
$repoName = "chic-house"
$token = Read-Host "أدخلي GitHub Personal Access Token" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

Write-Host ""
Write-Host "جاري إنشاء الـ repository..." -ForegroundColor Yellow

# إنشاء الـ repository باستخدام GitHub API
$headers = @{
    "Authorization" = "token $tokenPlain"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    name = $repoName
    description = "Chic House - متجر الهدايا والديكورات المنزلية"
    private = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "✅ تم إنشاء الـ repository بنجاح!" -ForegroundColor Green
    Write-Host "Repository URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host ""
    
    # ربط المشروع بـ GitHub
    Write-Host "جاري ربط المشروع بـ GitHub..." -ForegroundColor Yellow
    
    Set-Location "C:\Users\marie\Desktop\HAND MADE"
    
    # إزالة أي remote موجود
    git remote remove origin -ErrorAction SilentlyContinue
    
    # إضافة remote جديد
    git remote add origin "https://$tokenPlain@github.com/$username/$repoName.git"
    
    # تغيير اسم الـ branch لـ main
    git branch -M main
    
    # Push للـ repository
    Write-Host "جاري رفع الملفات..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ تم رفع المشروع بنجاح على GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/$username/$repoName" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ حدث خطأ: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "ملاحظة: تأكدي من:" -ForegroundColor Yellow
    Write-Host "1. الـ Token صحيح وله صلاحية 'repo'" -ForegroundColor Yellow
    Write-Host "2. الـ username صحيح" -ForegroundColor Yellow
    Write-Host "3. الـ repository مش موجود مسبقاً" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "يمكنك إنشاء الـ repository يدوياً واتباع التعليمات في GITHUB_SETUP.md" -ForegroundColor Cyan
}

# تنظيف الـ token من الذاكرة
$tokenPlain = $null
$token = $null

