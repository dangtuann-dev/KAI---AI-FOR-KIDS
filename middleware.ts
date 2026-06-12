import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('your-supabase-project') || url === '';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API and static files pass through without middleware auth checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let user: any = null;
  let role: string | null = null;
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (isMockMode()) {
    // Read mock auth cookie
    const mockSession = request.cookies.get('kai-mock-session')?.value;
    if (mockSession) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockSession));
        user = parsed;
        role = parsed.role;
      } catch (e) {
        console.error('Error parsing mock session cookie in middleware:', e);
      }
    }
  } else {
    // Production Supabase Auth check
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        user = authUser;
        // Fetch role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        role = profile?.role || null;
      }
    } catch (err) {
      console.error('Supabase auth error in middleware:', err);
    }
  }

  // Public auth routes (login / register)
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (user && role) {
      let redirectUrl = '/learn';
      if (role === 'admin') redirectUrl = '/admin/dashboard';
      else if (role === 'parent') redirectUrl = '/parent/dashboard';
      
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value);
      });
      return response;
    }
    
    // Redirect / to login by default
    if (pathname === '/') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value);
      });
      return response;
    }
    return supabaseResponse;
  }

  // Protected routes check
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect back URL
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }

  // Role-based access control redirects
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }
  if (pathname.startsWith('/parent') && role !== 'parent' && role !== 'admin') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }
  if (pathname.startsWith('/learn') && role !== 'student' && role !== 'admin') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
