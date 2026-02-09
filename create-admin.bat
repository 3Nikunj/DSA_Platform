@echo off
echo Creating admin user for DSA Learning Platform...

REM Navigate to the backend directory where the database is located
cd "apps/backend"

REM Check if the database exists
if not exist "prisma\dev.db" (
    echo ❌ Database file not found: prisma\dev.db
    echo Please make sure the backend is properly initialized.
    exit /b 1
)

echo 📊 Checking existing admin user...
sqlite3 prisma\dev.db "SELECT id, email, username, level, isPremium, isVerified FROM users WHERE email = 'admin@dsa-platform.com' OR username = 'admin';"

echo.
echo 🔑 Creating admin user with elevated privileges...
sqlite3 prisma\dev.db "INSERT INTO users (id, email, username, password, firstName, lastName, level, xp, coins, isVerified, isPremium, isActive, theme, language, createdAt, updatedAt) VALUES ('admin_$(date +%s)', 'admin@dsa-platform.com', 'admin', '\$2a\$12\$KQ6n5GWMWVn2fHbPRN0AJeK8J4XVLs6qKZHQXhfxK9N8f6P9z8J6G', 'Platform', 'Administrator', 10, 10000, 1000, 1, 1, 1, 'dark', 'en', datetime('now'), datetime('now'));"

echo.
echo ✅ Admin user created successfully!
echo 📧 Email: admin@dsa-platform.com
echo 🔑 Password: Admin@123!
echo 👤 Username: admin
echo ⭐ Level: 10
echo 💎 Premium: Yes
echo ✅ Verified: Yes
echo.
echo 🌐 Login at: http://localhost:5173/login
echo.
echo 📊 Verifying admin user creation...
sqlite3 prisma\dev.db "SELECT id, email, username, level, isPremium, isVerified FROM users WHERE email = 'admin@dsa-platform.com';"

pause