import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient(
    {
      req: request,
      res: response,
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === '/login';

  if ((error || !user) && !isLoginPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';

    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPath) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = '/';

    return NextResponse.redirect(appUrl);
  }

  return response;
}
