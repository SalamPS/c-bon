'use client';

import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white"
    >
      <LogOut className="inline-block" size={20} />
    </button>
  );
}
