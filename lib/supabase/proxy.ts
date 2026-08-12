import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // If env vars are missing (local dev without .env.local), skip auth check
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabaseAnonKey()
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminLogin = pathname === '/admin/login'

  // Protect /api/admin/* — respond with 401 JSON instead of redirect
  if (pathname.startsWith('/api/admin/') && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Protect /admin routes (but not the login page itself)
  if (pathname.startsWith('/admin') && !isAdminLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if already logged in and visiting login page
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
