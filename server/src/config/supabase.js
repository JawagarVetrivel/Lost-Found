import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || supabaseSecretKey;

let supabase = null;
let supabaseAnon = null;
let isConfigured = false;

if (supabaseUrl && (supabaseSecretKey || supabaseAnonKey) && supabaseUrl.startsWith('http')) {
  try {
    if (supabaseSecretKey) {
      supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    if (supabaseAnonKey) {
      supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    // Default supabase to anon if secret is missing
    if (!supabase) supabase = supabaseAnon;

    isConfigured = true;
    console.log('[Supabase] Initialized client successfully');
  } catch (err) {
    console.warn('[Supabase] Initialization warning:', err.message);
  }
} else {
  console.warn('[Supabase] Missing valid SUPABASE_URL and SUPABASE_SECRET_KEY. Operating in fallback/test mode.');
}

export { supabase, supabaseAnon, isConfigured };
