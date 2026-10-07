import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  (supabaseServiceKey || supabaseAnonKey) &&
  !supabaseUrl.includes('your-project-id')
);

export function getServerSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !supabaseUrl) {
    return null;
  }

  const keyToUse = (
    supabaseServiceKey && !supabaseServiceKey.includes('your-service-role')
      ? supabaseServiceKey
      : supabaseAnonKey
  );

  if (!keyToUse || keyToUse.includes('your-anon-key')) {
    return null;
  }

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
