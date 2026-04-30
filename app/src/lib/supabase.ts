import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uiwwcbojjfywimgcyhab.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_z1E7wJE_VgoBq30gdmkuPA_jCOjuWVN'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
