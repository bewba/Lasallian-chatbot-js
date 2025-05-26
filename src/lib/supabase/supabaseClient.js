import { createClient } from '@supabase/supabase-js'
import { env } from '$env/static/public'

console.log(env)

// Create a Supabase client using environment variable
    let supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://<project>.supabase.co' 
    let supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'


  export const supabase = createClient(supabaseUrl, supabaseAnonKey)