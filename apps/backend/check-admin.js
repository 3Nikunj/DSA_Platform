require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateAdmin() {
  try {
    // Check if admin user exists in auth
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error listing auth users:', authError);
      return;
    }

    const adminUser = authUsers.users.find(
      user => user.email === 'admin@dsa.com'
    );

    if (adminUser) {
      console.log('Admin user exists in auth:', adminUser.id);

      // Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', adminUser.id)
        .single();

      if (userError) {
        console.log('Admin user not found in users table, creating profile...');

        // Create user profile
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: adminUser.id,
            email: 'admin@dsa.com',
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            level: 10,
            xp: 10000,
            coins: 1000,
            is_verified: true,
            is_premium: true,
          },
        ]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('Admin user profile created successfully!');
        }
      } else {
        console.log('Admin user profile exists:', userData);
      }
    } else {
      console.log('Admin user does not exist. Creating...');

      // Create admin user in auth
      const { data: authData, error: createError } =
        await supabase.auth.admin.createUser({
          email: 'admin@dsa.com',
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          },
        });

      if (createError) {
        console.error('Error creating admin user:', createError);
        return;
      }

      console.log('Admin user created in auth:', authData.user.id);

      // Create user profile
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: 'admin@dsa.com',
          username: 'admin',
          first_name: 'Admin',
          last_name: 'User',
          level: 10,
          xp: 10000,
          coins: 1000,
          is_verified: true,
          is_premium: true,
        },
      ]);

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      } else {
        console.log('Admin user profile created successfully!');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndCreateAdmin();