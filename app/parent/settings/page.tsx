'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Lock, CheckCircle, Save, Settings, AlertCircle } from 'lucide-react';

export default function ParentSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || '');
      }
    }
    loadProfile();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Update display name
      const { error: profError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (profError) throw profError;

      // Update password if provided
      if (password.trim().length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password.trim()
        });
        if (passError) throw passError;
        setPassword(''); // clear password field
      } else if (password.trim() !== '' && password.trim().length < 6) {
        setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
        setLoading(false);
        return;
      }

      setSuccessMsg('Cập nhật tài khoản phụ huynh thành công! ✨');
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi cập nhật cấu hình. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-800 font-display mb-4 flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-rose-500" />
          Cài đặt Tài khoản Phụ huynh
        </h2>

        {profile ? (
          <form onSubmit={handleUpdateSettings} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 text-center">
                <CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" /> {successMsg}
              </div>
            )}

            {/* Email (Readonly) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Email Đăng nhập
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Họ và Tên Phụ huynh
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Họ tên phụ huynh..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-rose-300 rounded-xl outline-none font-bold text-xs text-slate-700 transition-colors"
                />
              </div>
            </div>

            {/* Update Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Mật khẩu mới (Bỏ trống nếu không đổi)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Nhập tối thiểu 6 ký tự..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-rose-300 rounded-xl outline-none font-bold text-xs text-slate-700 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:bg-slate-200"
            >
              {loading ? '...' : <><Save className="w-4 h-4" /> Lưu cấu hình</>}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold">Đang tải hồ sơ...</span>
          </div>
        )}
      </div>
    </div>
  );
}
