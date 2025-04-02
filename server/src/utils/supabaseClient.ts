// server/src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;

// Use service role key for server operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regular anon key (subject to RLS policies)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Error: Supabase URL or Anon Key not found in environment variables.");
}

// Create a client with the anon key (subject to RLS policies)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Create a separate client with the service role key (bypasses RLS)
// Only use this for trusted server operations
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl!, supabaseServiceKey) : supabase; // Fall back to regular client if service key not available

console.log("Supabase clients initialized.");
