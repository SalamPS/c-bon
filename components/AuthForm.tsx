'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function getAuthErrorMessage(error: { message?: string; code?: string } | null): string {
  const normalizedMessage = error?.message?.toLowerCase() ?? '';
  const normalizedCode = error?.code?.toLowerCase() ?? '';

  if (
    normalizedCode === 'invalid_login_credentials' ||
    normalizedMessage.includes('invalid login credentials')
  ) {
    return 'Email atau password kamu salah. Coba cek lagi ya.';
  }

  if (
    normalizedCode === 'email_not_confirmed' ||
    normalizedMessage.includes('email not confirmed')
  ) {
    return 'Email kamu belum diverifikasi. Cek inbox dulu, ya.';
  }

  if (
    normalizedCode === 'user_already_exists' ||
    normalizedMessage.includes('user already registered') ||
    normalizedMessage.includes('already registered')
  ) {
    return 'Email ini sudah terdaftar. Langsung login aja, ya.';
  }

  if (
    normalizedCode === 'weak_password' ||
    normalizedMessage.includes('password should be at least')
  ) {
    return 'Password-nya kurang kuat. Pakai minimal 6 karakter, ya.';
  }

  if (
    normalizedCode === 'over_email_send_rate_limit' ||
    normalizedMessage.includes('rate limit')
  ) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi, ya.';
  }

  return 'Ada kendala saat proses autentikasi. Coba lagi sebentar lagi, ya.';
}

export function AuthForm({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; error: boolean } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });
        if (signUpError) {
          setError({ message: getAuthErrorMessage(signUpError), error: true });
          return;
        }

        // Supabase can return no error for existing emails when email confirmation is enabled.
        if ((signUpData.user?.identities?.length ?? 1) === 0) {
          setError({ message: 'Email ini sudah terdaftar. Langsung login aja, ya.', error: true });
          return;
        }

        setError({ message: 'Pendaftaran berhasil! Silakan login.', error: false });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signInError) {
          setError({ message: getAuthErrorMessage(signInError), error: true });
          return;
        }
        router.push('/');
      }
    } catch {
      setError({ message: 'Lagi ada gangguan sistem. Coba lagi bentar lagi, ya.', error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div
          className={`p-3 rounded-md border ${
            error.error
              ? 'bg-rose-900/20 border-rose-900'
              : 'bg-emerald-900/20 border-emerald-900'
          }`}
        >
          <p className={`text-sm ${error.error ? 'text-rose-400' : 'text-emerald-400'}`}>
            {error.message}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Memproses...' : mode === 'signup' ? 'Daftar' : 'Login'}
      </button>
    </form>
  );
}
