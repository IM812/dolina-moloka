import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS completely.
 * Use ONLY in server-side API routes, never expose to the client.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase service role env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}
