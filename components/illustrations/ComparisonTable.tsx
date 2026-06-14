'use client';

import React from 'react';

interface ColumnData {
  label: string;
  items: string[];
}

interface Data {
  type: 'comparison_table';
  title?: string;
  columnA: ColumnData;
  columnB: ColumnData;
}

export function ComparisonTable({ data }: { data: Data }) {
  const { title, columnA, columnB } = data;
  const maxRows = Math.max(columnA.items.length, columnB.items.length);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
      {title && (
        <h4 className="font-display font-black text-slate-800 text-sm mb-4 text-center uppercase tracking-wide">
          📊 {title}
        </h4>
      )}

      <div className="border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Headers */}
        <div className="grid grid-cols-2 bg-slate-50 border-b-2 border-slate-100">
          <div className="p-3 text-center border-r-2 border-slate-100 font-display font-black text-xs text-purple-700">
            {columnA.label}
          </div>
          <div className="p-3 text-center font-display font-black text-xs text-indigo-700">
            {columnB.label}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: maxRows }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-2 divide-x divide-slate-100 text-xs font-bold text-slate-600">
              <div className="p-3 text-center hover:bg-purple-50/20 transition-colors">
                {columnA.items[idx] || '-'}
              </div>
              <div className="p-3 text-center hover:bg-indigo-50/20 transition-colors">
                {columnB.items[idx] || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
