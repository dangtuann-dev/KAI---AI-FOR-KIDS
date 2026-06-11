import React from 'react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-dvh bg-[#F8F7FF] relative">
      {children}
    </div>
  );
}
