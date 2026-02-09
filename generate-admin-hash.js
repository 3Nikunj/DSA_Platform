const bcrypt = require('bcryptjs');

// Generate a pre-hashed password for the admin user
const password = 'Admin@123!';
const hashedPassword = bcrypt.hashSync(password, 12);

console.log('Admin Password Hash:');
console.log(hashedPassword);
console.log('');
console.log('Use this hash in your SQL INSERT statement:');
console.log(`INSERT INTO users (id, email, username, password, firstName, lastName, level, xp, coins, isVerified, isPremium, isActive, theme, language, createdAt, updatedAt) 
VALUES ('admin_${Date.now()}', 'admin@dsa-platform.com', 'admin', '${hashedPassword}', 'Platform', 'Administrator', 10, 10000, 1000, 1, 1, 1, 'dark', 'en', datetime('now'), datetime('now'));`);