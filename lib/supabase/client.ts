import { createClient } from "@supabase/supabase-js"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Using fallback values for development only.")
}

// Use fallback values if environment variables are not defined
// This is only for development purposes and should not be used in production
const fallbackUrl = "https://your-project-id.supabase.co"
const fallbackKey = "your-public-anon-key"

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function createSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  // Use environment variables if available, otherwise use fallbacks
  const url = supabaseUrl || fallbackUrl
  const key = supabaseAnonKey || fallbackKey

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return supabaseInstance
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// Export a singleton instance for direct imports
export const supabase = createSupabaseClient()

// Export types for convenience
export type { SupabaseClient } from "@supabase/supabase-js"

