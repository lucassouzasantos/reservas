import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
export const hasValidSupabaseConfig = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_project_url_here' &&
         supabaseAnonKey !== 'your_supabase_anon_key_here' &&
         supabaseUrl.includes('supabase.co')
}

// Only create client if we have valid configuration
export const supabase = hasValidSupabaseConfig() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Export the raw values for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isValid: hasValidSupabaseConfig()
}