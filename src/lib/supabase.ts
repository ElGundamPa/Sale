import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env",
  );
}

// Untyped client — schema-typed reads/writes were causing inference issues in
// supabase-js v2 with our Insert/Update shapes. Hooks cast to known row types.
export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const FUNCTIONS_URL = url ? `${url}/functions/v1` : "";
