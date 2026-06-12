'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Settings, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-slate-50 relative pb-20 md:pb-6 max-w-5xl mx-auto w-full md:px-4">
      {/* Top Header */}
      <header className="h-14 px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm md:rounded-b-2xl md:border md:border-slate-100 md:mt-2">
        <div className="flex items-center gap-6">
          <span className="text-base font-extrabold text-slate-800 font-display flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-rose-500" />
            <span>PHỤ HUYNH KAI</span>
          </span>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/parent/dashboard"
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all ${
                pathname.startsWith('/parent/dashboard') ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Báo cáo học tập
            </Link>
            <Link
              href="/parent/settings"
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all ${
                pathname.startsWith('/parent/settings') ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Cài đặt tài khoản
            </Link>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-full transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:py-6 md:px-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white border-t border-slate-100 flex items-center justify-around shadow-2xl z-40">
        <Link
          href="/parent/dashboard"
          className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
            pathname.startsWith('/parent/dashboard') ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-bold font-display uppercase tracking-wider">Báo cáo</span>
        </Link>
        
        <Link
          href="/parent/settings"
          className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
            pathname.startsWith('/parent/settings') ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold font-display uppercase tracking-wider">Cài đặt</span>
        </Link>
      </nav>
    </div>
  );
}
