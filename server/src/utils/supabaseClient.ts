// server/src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Error: Supabase URL or Anon Key not found in environment variables.");
	// Consider throwing an error or exiting in a real application
	// process.exit(1);
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

console.log("Supabase client initialized."); // Add log to confirm initialization
