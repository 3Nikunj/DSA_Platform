const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect to the SQLite database
const dbPath = path.join(__dirname, 'apps/backend/prisma/dev.db');
const db = new sqlite3.Database(dbPath);

// Admin user data with elevated privileges
const adminData = {
  id: 'admin_' + Date.now(),
  email: 'admin@dsa-platform.com',
  username: 'admin',
  password: 'Admin@123!',
  firstName: 'Platform',
  lastName: 'Administrator',
  level: 10,
  xp: 10000,
  coins: 1000,
  isVerified: true,
  isPremium: true,
  isActive: true,
  theme: 'dark',
  language: 'en',
};

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Insert admin user
    const insertQuery = `
      INSERT INTO users (
        id, email, username, password, firstName, lastName, 
        level, xp, coins, isVerified, isPremium, isActive, 
        theme, language, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    db.run(
      insertQuery,
      [
        adminData.id,
        adminData.email,
        adminData.username,
        hashedPassword,
        adminData.firstName,
        adminData.lastName,
        adminData.level,
        adminData.xp,
        adminData.coins,
        adminData.isVerified ? 1 : 0,
        adminData.isPremium ? 1 : 0,
        adminData.isActive ? 1 : 0,
        adminData.theme,
        adminData.language,
      ],
      function (err) {
        if (err) {
          console.error('Error creating admin user:', err.message);
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('Admin user already exists. Checking current admin...');
            checkExistingAdmin();
          }
        } else {
          console.log('✅ Admin user created successfully!');
          console.log('📧 Email:', adminData.email);
          console.log('🔑 Password:', adminData.password);
          console.log('👤 Username:', adminData.username);
          console.log('⭐ Level:', adminData.level);
          console.log('💎 Premium:', adminData.isPremium);
          console.log('✅ Verified:', adminData.isVerified);
          console.log('');
          console.log('🌐 Login at: http://localhost:5173/login');
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

function checkExistingAdmin() {
  const selectQuery = `SELECT id, email, username, level, isPremium, isVerified FROM users WHERE email = ? OR username = ?`;

  db.get(selectQuery, [adminData.email, adminData.username], (err, row) => {
    if (err) {
      console.error('Error checking existing admin:', err.message);
    } else if (row) {
      console.log('📋 Existing admin user found:');
      console.log('📧 Email:', row.email);
      console.log('👤 Username:', row.username);
      console.log('⭐ Level:', row.level);
      console.log('💎 Premium:', row.isPremium ? 'Yes' : 'No');
      console.log('✅ Verified:', row.isVerified ? 'Yes' : 'No');
      console.log('');
      console.log('🌐 Login at: http://localhost:5173/login');
      console.log('🔑 Default password: Admin@123!');
    } else {
      console.log('❌ No admin user found.');
    }
    db.close();
  });
}

// Run the admin creation
createAdmin();
