/**
 * Some environment providers store values with stray wrapping quotes
 * (e.g. `"https://project.supabase.co"` as the literal string value).
 * This strips a single layer of matching leading/trailing quotes so
 * `createServerClient`/`createBrowserClient` always receive a clean value.
 */
function unquote(value: string | undefined): string | undefined {
  if (!value) return value
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export function getSupabaseUrl(): string {
  return unquote(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? ''
}

export function getSupabaseAnonKey(): string {
  return unquote(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? ''
}

export function getSupabaseServiceRoleKey(): string {
  return unquote(process.env.SUPABASE_SERVICE_ROLE_KEY) ?? ''
}
