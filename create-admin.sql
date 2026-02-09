-- SQL script to create admin user for DSA Learning Platform
-- Run this script using: sqlite3 apps/backend/prisma/dev.db < create-admin.sql

-- Check if admin already exists
SELECT 'Existing admin user:' as status;
SELECT id, email, username, level, isPremium, isVerified 
FROM users 
WHERE email = 'admin@dsa-platform.com' OR username = 'admin';

-- Delete existing admin if present (optional, uncomment if needed)
-- DELETE FROM users WHERE email = 'admin@dsa-platform.com' OR username = 'admin';

-- Insert new admin user
INSERT INTO users (
  id, email, username, password, firstName, lastName, 
  level, xp, coins, isVerified, isPremium, isActive, 
  theme, language, createdAt, updatedAt
) VALUES (
  'admin_1765473349289', 
  'admin@dsa-platform.com', 
  'admin', 
  '$2a$12$a.OlDS.n43xDdu0paD3xO.WbeiYwsuH.ukVZavOFs9NAS51quirBa', 
  'Platform', 
  'Administrator', 
  10, 
  10000, 
  1000, 
  1, 
  1, 
  1, 
  'dark', 
  'en', 
  datetime('now'), 
  datetime('now')
);

-- Verify admin creation
SELECT '' as separator;
SELECT '✅ Admin user created successfully!' as status;
SELECT '📧 Email: admin@dsa-platform.com' as info;
SELECT '🔑 Password: Admin@123!' as info;
SELECT '👤 Username: admin' as info;
SELECT '⭐ Level: 10' as info;
SELECT '💎 Premium: Yes' as info;
SELECT '✅ Verified: Yes' as info;
SELECT '🌐 Login at: http://localhost:5173/login' as info;

-- Show final admin user
SELECT '' as separator;
SELECT 'Final admin user details:' as status;
SELECT id, email, username, level, isPremium, isVerified 
FROM users 
WHERE email = 'admin@dsa-platform.com';