'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, User, GraduationCap, ChevronRight } from 'lucide-react';
import OwlAvatar from '@/components/chat/OwlAvatar';

type RegisterRole = 'student' | 'parent';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<RegisterRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState<number>(3);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);

    if (fullName.trim().length < 2) {
      setErrorMsg('Vui lòng nhập tên đầy đủ của bé hoặc phụ huynh!');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            grade: role === 'student' ? grade : undefined,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email.split('@')[0]}`,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Đăng ký thất bại, vui lòng kiểm tra thông tin!');
        setLoading(false);
        return;
      }

      setSuccessMsg('Đăng ký tài khoản thành công! 🎉 Đang chuyển hướng...');
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  const isStudent = role === 'student';
  const accentClass = isStudent ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white';
  const textClass = isStudent ? 'text-purple-600' : 'text-rose-500';
  const borderClass = isStudent ? 'border-purple-100 focus:border-purple-300' : 'border-rose-100 focus:border-rose-300';

  return (
    <div className="flex-1 flex items-center justify-center min-h-dvh p-4 bg-[#F8F7FF]">
      <div className="w-full max-w-md bg-white md:shadow-2xl md:rounded-3xl md:border md:border-purple-100 p-6 md:p-8 flex flex-col">
        {/* Mascot Header */}
      <div className="flex flex-col items-center mb-6">
        <OwlAvatar
          state="idle"
          text={
            isStudent
              ? 'Tạo tài khoản mới để tham gia cùng KAI nha! 🐻'
              : 'Đăng ký tài khoản phụ huynh để đồng hành cùng con.'
          }
        />
        <h1 className="text-3xl font-extrabold text-slate-800 font-display mt-2">
          ĐĂNG KÝ KAI
        </h1>
      </div>

      {/* Role Toggle */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6 shadow-inner gap-1">
        <button
          onClick={() => setRole('student')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold font-display transition-all ${
            isStudent ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🎒 Con là Học sinh
        </button>
        <button
          onClick={() => setRole('parent')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold font-display transition-all ${
            !isStudent ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          👨‍👩‍👧 Phụ huynh của bé
        </button>
      </div>

      {/* Register Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border-2 border-rose-100 rounded-2xl text-xs font-bold text-rose-500 text-center animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 text-center">
            {successMsg}
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
            {isStudent ? 'Họ và tên của bé' : 'Họ và tên Phụ huynh'}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder={isStudent ? 'Ví dụ: Nguyễn Minh' : 'Ví dụ: Nguyễn Văn Ba'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-2xl outline-none font-bold text-slate-700 transition-all ${borderClass} ${
                isStudent ? 'text-lg font-display' : 'text-sm'
              }`}
            />
          </div>
        </div>

        {/* Grade Selection for Students */}
        {isStudent && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
              Bé đang học Lớp mấy?
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-2xl outline-none font-bold text-slate-600 transition-all appearance-none cursor-pointer ${borderClass} text-lg font-display`}
              >
                <option value={1}>Lớp 1 (6 tuổi)</option>
                <option value={2}>Lớp 2 (7 tuổi)</option>
                <option value={3}>Lớp 3 (8 tuổi)</option>
                <option value={4}>Lớp 4 (9 tuổi)</option>
                <option value={5}>Lớp 5 (10 tuổi)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-extrabold">
                ▾
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
            Email tài khoản
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="ba-con-hoc-kai@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-2xl outline-none font-bold text-slate-700 transition-all ${borderClass} ${
                isStudent ? 'text-lg font-display' : 'text-sm'
              }`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-500 font-display uppercase tracking-wider pl-1">
            Mật khẩu (từ 6 ký tự)
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-2xl outline-none font-bold text-slate-700 transition-all ${borderClass} ${
                isStudent ? 'text-lg font-display' : 'text-sm'
              }`}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${accentClass} ${
            isStudent ? 'text-lg font-display font-extrabold' : 'text-sm font-bold'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Đăng ký tài khoản
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Link to login */}
      <div className="text-center mt-6">
        <p className="text-xs text-slate-400 font-bold">
          Đã có tài khoản rồi?{' '}
          <Link href="/login" className={`font-extrabold hover:underline ${textClass}`}>
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
    </div>
  );

}
