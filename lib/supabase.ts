import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xeppdnzdidebqrrkeyow.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcHBkbnpkaWRlYnFycmtleW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3NTI2NTAsImV4cCI6MjA0NTMyODY1MH0.EqlJmy7v9vfQF-b66xxMekGti-yAM59-v-UcGgNnmJQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})