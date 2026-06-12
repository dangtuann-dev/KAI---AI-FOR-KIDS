'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-slate-50 relative pb-10 max-w-6xl mx-auto w-full md:px-4">
      {/* Admin Header */}
      <header className="h-14 px-4 bg-slate-800 text-white flex items-center justify-between shrink-0 shadow-md md:rounded-b-2xl md:mt-2">
        <span className="text-sm font-extrabold font-display flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>KAI ADMIN PANEL</span>
        </span>
        
        <button
          onClick={handleLogout}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full transition-colors active:scale-95"
          title="Đăng xuất Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
