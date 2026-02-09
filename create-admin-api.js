const axios = require('axios');

/**
 * Create admin user via API
 * This script creates an admin user using the existing registration endpoint
 */

const API_BASE = 'http://localhost:5000/api';

const adminData = {
  email: 'admin@dsa-platform.com',
  username: 'admin',
  password: 'Admin@123!',
  firstName: 'Platform',
  lastName: 'Administrator'
};

async function createAdminViaAPI() {
  try {
    console.log('👑 Creating admin user via API...');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);

    // Try to register the admin user
    const response = await axios.post(`${API_BASE}/auth/register`, adminData);
    
    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      
      // Show login info
      console.log('\n🔐 Admin Login Credentials:');
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Login URL: http://localhost:5173/login`);
      
      return response.data;
    }
  } catch (error) {
    if (error.response?.data?.error?.message?.includes('already registered') || 
        error.response?.data?.error?.message?.includes('already taken')) {
      console.log('⚠️  Admin user already exists. You can log in with:');
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Login URL: http://localhost:5173/login`);
      return;
    }
    
    console.error('❌ Error creating admin:', error.response?.data?.error || error.message);
  }
}

// Run the script
if (require.main === module) {
  createAdminViaAPI();
}

module.exports = { createAdminViaAPI };