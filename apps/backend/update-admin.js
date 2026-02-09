require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminUser() {
  try {
    // First, delete the newly created user if it exists
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const newAdminUser = authUsers.users.find(user => user.id === '93c95307-3c36-445f-9781-6e293260c0be');
    
    if (newAdminUser) {
      console.log('Deleting newly created user...');
      await supabase.auth.admin.deleteUser('93c95307-3c36-445f-9781-6e293260c0be');
      console.log('New user deleted');
    }

    // Now update the existing admin user's email and password
    console.log('Updating existing admin user...');
    const { data, error } = await supabase.auth.admin.updateUserById(
      '8afb6571-7776-49bd-8aef-7a46fc9c277b',
      {
        email: 'admin@dsa.com',
        password: 'admin123',
        email_confirm: true
      }
    );

    if (error) {
      console.error('Error updating admin user:', error);
    } else {
      console.log('Admin user updated successfully!');
      console.log('Email:', data.user.email);
      console.log('You can now login with:');
      console.log('Email: admin@dsa.com');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdminUser();