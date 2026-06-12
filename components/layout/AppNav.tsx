'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Shield, Sparkles, User } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function AppNav({ items, role }: { items: NavItem[]; role: 'student' | 'parent' | 'admin' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || '');
        }
      } catch (err) {
        console.error('Error fetching user info for AppNav:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const getRoleTheme = () => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-slate-900',
          text: 'text-slate-100',
          hoverBg: 'hover:bg-slate-800',
          activeBg: 'bg-slate-800 text-amber-400',
          iconColor: 'text-amber-400',
          accent: 'border-slate-800',
          roleLabel: 'Quản trị viên',
          logoIcon: <Shield className="w-6 h-6 text-amber-400" />
        };
      case 'parent':
        return {
          bg: 'bg-white',
          text: 'text-slate-700',
          hoverBg: 'hover:bg-slate-50 hover:text-slate-900',
          activeBg: 'bg-rose-50 text-rose-600',
          iconColor: 'text-rose-500',
          accent: 'border-slate-100',
          roleLabel: 'Phụ huynh',
          logoIcon: <Shield className="w-6 h-6 text-rose-500" />
        };
      case 'student':
      default:
        return {
          bg: 'bg-indigo-950',
          text: 'text-indigo-100',
          hoverBg: 'hover:bg-indigo-900',
          activeBg: 'bg-indigo-900 text-white',
          iconColor: 'text-indigo-400',
          accent: 'border-indigo-900',
          roleLabel: 'Học sinh',
          logoIcon: <Sparkles className="w-6 h-6 text-yellow-400" />
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* Sidebar for Desktop (lg and larger) */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 ${theme.bg} ${theme.text} border-r ${theme.accent} px-4 py-6 z-50`}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 mb-8">
          {theme.logoIcon}
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-wider text-slate-800 dark:text-white">KAI LEARNING</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{theme.roleLabel}</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? theme.activeBg + ' shadow-sm'
                    : `${theme.text} hover:bg-slate-50 dark:hover:bg-slate-800`
                }`}
              >
                <span className={isActive ? '' : theme.iconColor}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu at Bottom */}
        <div className={`mt-auto pt-4 border-t ${theme.accent} flex flex-col gap-3`}>
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 rounded-full ${role === 'admin' ? 'bg-slate-800' : role === 'parent' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-900'} flex items-center justify-center`}>
              <User className="w-5 h-5 text-slate-500 dark:text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-slate-700 dark:text-white">{userName || 'KAI User'}</span>
              <span className="text-[9px] text-slate-400 truncate uppercase font-bold tracking-wider">{theme.roleLabel}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile (< lg) */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-100 flex justify-around py-2 z-40 shadow-2xl rounded-t-3xl">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#6C63FF] font-black'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="text-[10px] font-bold font-display uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
