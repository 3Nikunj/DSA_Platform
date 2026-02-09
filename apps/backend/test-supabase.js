const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!supabaseServiceRoleKey);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('Connection test result:', { data, error });
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
