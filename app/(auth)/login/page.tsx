'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Lock, Mail, ChevronRight, GraduationCap } from 'lucide-react';
import OwlAvatar from '@/components/chat/OwlAvatar';

type UserRole = 'student' | 'parent' | 'admin';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotState, setMascotState] = useState<'idle' | 'listening' | 'speaking'>('idle');

  // Pre-fill credentials based on selected role for easy prototype testing
  useEffect(() => {
    if (role === 'admin') {
      setEmail('tuan@kai.com');
      setPassword('tuan1234');
    } else if (role === 'student') {
      setEmail('minh@kai.com');
      setPassword('minh1234');
    } else if (role === 'parent') {
      setEmail('ba@kai.com');
      setPassword('ba1234');
    }
    setErrorMsg('');
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    setMascotState('listening');

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMascotState('idle');
        setErrorMsg(error.message || 'Email hoặc mật khẩu không chính xác!');
        setLoading(false);
        return;
      }

      setMascotState('speaking');

      // Double check role
      const user = data.user;
      
      // We read role from profiles in database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || role;

      // Redirect based on role
      setTimeout(() => {
        if (redirectPath) {
          router.push(redirectPath);
        } else if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'parent') {
          router.push('/parent/dashboard');
        } else {
          router.push('/learn');
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setErrorMsg('Đăng nhập thất bại. Vui lòng thử lại!');
      setMascotState('idle');
      setLoading(false);
    }
  };

  // Set colors based on role
  const getThemeClasses = () => {
    switch (role) {
      case 'parent':
        return {
          accentColor: 'bg-rose-500 hover:bg-rose-600',
          textColor: 'text-rose-500',
          borderColor: 'border-rose-100',
          focusBorder: 'focus:border-rose-400',
          pillActive: 'bg-rose-500 text-white shadow-md',
          fontSize: 'text-base',
        };
      case 'admin':
        return {
          accentColor: 'bg-slate-700 hover:bg-slate-800',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          focusBorder: 'focus:border-slate-400',
          pillActive: 'bg-slate-700 text-white shadow-md',
          fontSize: 'text-base',
        };
      case 'student':
      default:
        return {
          accentColor: 'bg-[#6C63FF] hover:bg-[#5A52E6]',
          textColor: 'text-[#6C63FF]',
          borderColor: 'border-purple-100',
          focusBorder: 'focus:border-purple-300',
          pillActive: 'bg-[#6C63FF] text-white shadow-md',
          fontSize: 'text-lg', // larger text for student UI
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[#F8F7FF]">
      {/* Left Column - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <OwlAvatar size="xl" state="idle" />
          <h2 className="font-display text-4xl font-black mt-6 tracking-wide">
            Học vui mỗi ngày cùng KAI!
          </h2>
          <p className="mt-3 opacity-90 text-lg font-medium">
            Người bạn đồng hành thông minh cho bé tiểu học
          </p>
        </div>
      </div>

      {/* Right Column - Mobile & Desktop */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl border border-purple-100 p-6 md:p-8 flex flex-col">
          {/* Top Section - Mascot */}
          <div className="flex flex-col items-center mb-6">
            <OwlAvatar
              size="md"
              state={mascotState}
              text={
                role === 'student'
                  ? 'Chào bé! Đăng nhập để học cùng KAI nhé! 🐻'
                  : role === 'parent'
                  ? 'Chào Phụ huynh! Xem báo cáo học tập của con.'
                  : 'Trang Quản lý hệ thống KAI Learning.'
              }
            />
            <h1 className="text-3xl font-extrabold text-slate-800 font-display mt-2 lg:hidden">
              KAI LEARNING
            </h1>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5 lg:hidden">
              Prototype v1.0
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6 shadow-inner gap-1">
            <button
              onClick={() => setRole('student')}
              type="button"
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
                role === 'student' ? theme.pillActive : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🎒 Học sinh
            </button>
            <button
              onClick={() => setRole('parent')}
              type="button"
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
                role === 'parent' ? theme.pillActive : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              👨‍👩‍👧 Phụ huynh
            </button>
            <button
              onClick={() => setRole('admin')}
              type="button"
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
                role === 'admin' ? theme.pillActive : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ⚙️ Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-100 rounded-2xl text-xs font-bold text-rose-500 text-center animate-shake">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="nhapemail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${theme.borderColor} ${theme.focusBorder} rounded-2xl outline-none font-bold text-slate-700 transition-all ${theme.fontSize}`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${theme.borderColor} ${theme.focusBorder} rounded-2xl outline-none font-bold text-slate-700 transition-all ${theme.fontSize}`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 ${theme.accentColor} text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                role === 'student' ? 'text-lg font-display' : 'text-sm'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Đăng nhập ngay
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Redirect Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400 font-bold">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className={`font-extrabold hover:underline ${theme.textColor}`}
              >
                Đăng ký ngay tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen bg-[#F8F7FF]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-500 font-display animate-pulse">Đang tải KAI...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

