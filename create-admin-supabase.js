const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user in Supabase...');

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email: 'admin@dsa-platform.com',
      password: 'Admin@123!',
      email_confirm: true, // Auto-verify email
      user_metadata: {
        username: 'admin',
        first_name: 'Platform',
        last_name: 'Administrator',
      },
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create admin profile in users table
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: 'admin@dsa-platform.com',
          username: 'admin',
          first_name: 'Platform',
          last_name: 'Administrator',
          is_verified: true,
          is_premium: true,
          is_active: true,
          level: 10,
          xp: 10000,
          coins: 1000,
          theme: 'dark',
          language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating user profile:', userError);
      // Clean up the auth user if profile creation fails
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@dsa-platform.com');
    console.log('🔑 Password: Admin@123!');
    console.log('👤 Username: admin');
    console.log('⭐ Level: 10');
    console.log('💎 Premium: Yes');
    console.log('✅ Verified: Yes');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the admin creation
createAdminUser();