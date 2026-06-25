'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/AuthForm';

export function LoginView() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-[#1d2337] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">C-Bon by LamP</h1>
          <p className="text-gray-400">
            Catat siapa hutang ke kamu, atau kamu hutang ke siapa
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {showSignup ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Daftar</h2>
              <AuthForm key="signup" mode="signup" />
              <p className="text-center text-sm text-gray-400 mt-4">
                Sudah punya akun?{' '}
                <button
                  onClick={() => setShowSignup(false)}
                  className="cursor-pointer font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
              <AuthForm key="login" mode="login" />
              <p className="text-center text-sm text-gray-400 mt-4">
                Belum punya akun?{' '}
                <button
                  onClick={() => setShowSignup(true)}
                  className="cursor-pointer font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Daftar
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
