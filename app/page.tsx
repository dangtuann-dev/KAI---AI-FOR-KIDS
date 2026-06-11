'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen bg-[#F8F7FF]">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xs font-bold text-slate-500 font-display">Đang mở KAI Learning...</p>
    </div>
  );
}
