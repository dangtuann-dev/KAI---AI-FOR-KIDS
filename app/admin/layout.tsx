'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { AppNav, NavItem } from '@/components/layout/AppNav';

const adminNavItems: NavItem[] = [
  {
    label: 'Tổng quan',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
];

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
    <div className="min-h-dvh bg-slate-50 flex flex-col lg:flex-row">
      <AppNav items={adminNavItems} role="admin" />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Admin Header - Visible on Mobile only */}
        <header className="h-14 px-4 bg-slate-800 text-white flex items-center justify-between shrink-0 shadow-md lg:hidden">
          <span className="text-sm font-extrabold font-display flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>KAI ADMIN</span>
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
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
