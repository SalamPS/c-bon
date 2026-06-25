import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';

export const createClient = (cookies: NextRequest['cookies']) => {
  return createRouteHandlerClient(
    {
      cookies: () =>
        cookies as unknown as ReturnType<
          typeof import('next/headers').cookies
        >,
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
};
