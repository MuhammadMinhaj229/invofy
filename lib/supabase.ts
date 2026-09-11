import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Supabase client for Invoify → CRM sync.
 * Uses the anon key (RLS enforced). A new instance is created once per module.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
