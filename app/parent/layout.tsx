'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Settings, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { AppNav, NavItem } from '@/components/layout/AppNav';

const parentNavItems: NavItem[] = [
  {
    label: 'Báo cáo',
    href: '/parent/dashboard',
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    label: 'Cài đặt',
    href: '/parent/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function ParentLayout({
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
    <div className="min-h-dvh bg-slate-50 flex flex-col lg:flex-row">
      <AppNav items={parentNavItems} role="parent" />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Parent Mobile Header - Visible on Mobile only */}
        <header className="h-14 px-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm lg:hidden">
          <span className="text-base font-extrabold text-slate-800 font-display flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-rose-500" />
            <span>PHỤ HUYNH KAI</span>
          </span>
          
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-full transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Parent Content Area */}
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
