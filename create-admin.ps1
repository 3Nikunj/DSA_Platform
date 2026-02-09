$adminData = @{
    email = "admin@dsa-platform.com"
    username = "admin"
    password = "Admin@123!"
    firstName = "Platform"
    lastName = "Administrator"
} | ConvertTo-Json

try {
    Write-Host "👑 Creating admin user..." -ForegroundColor Yellow
    Write-Host "   Email: admin@dsa-platform.com" -ForegroundColor Gray
    Write-Host "   Username: admin" -ForegroundColor Gray
    Write-Host "   Password: Admin@123!" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $adminData
    
    if ($response.success) {
        Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
        Write-Host "   User ID: $($response.user.id)" -ForegroundColor Green
        Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Green
        
        Write-Host "`n🔐 Admin Login Credentials:" -ForegroundColor Cyan
        Write-Host "   Email: admin@dsa-platform.com" -ForegroundColor White
        Write-Host "   Password: Admin@123!" -ForegroundColor White
        Write-Host "   Login URL: http://localhost:5173/login" -ForegroundColor White
        
        Write-Host "`n🚀 Admin user is ready to use!" -ForegroundColor Green
        Write-Host "   The admin has elevated privileges (Level 1, Premium, Verified)." -ForegroundColor Green
    }
} catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*already registered*" -or $errorMessage -like "*already taken*") {
        Write-Host "⚠️  Admin user already exists. You can log in with:" -ForegroundColor Yellow
        Write-Host "   Email: admin@dsa-platform.com" -ForegroundColor White
        Write-Host "   Password: Admin@123!" -ForegroundColor White
        Write-Host "   Login URL: http://localhost:5173/login" -ForegroundColor White
    } else {
        Write-Host "❌ Error creating admin:" -ForegroundColor Red
        Write-Host "   $errorMessage" -ForegroundColor Red
    }
}