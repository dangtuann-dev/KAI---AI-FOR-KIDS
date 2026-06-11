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
      const response = NextResponse.next();
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
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'parent') return NextResponse.redirect(new URL('/parent/dashboard', request.url));
      return NextResponse.redirect(new URL('/learn', request.url));
    }
    
    // Redirect / to login by default
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes check
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect back URL
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control redirects
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/parent') && role !== 'parent' && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/learn') && role !== 'student' && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
