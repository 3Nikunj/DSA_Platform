import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client for backend operations (has admin privileges)
export const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);

// Anon client for public operations
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseService;