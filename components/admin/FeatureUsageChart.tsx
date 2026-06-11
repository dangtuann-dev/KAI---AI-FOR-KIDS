'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChartIcon, ShieldAlert } from 'lucide-react';

interface FeatureUsageChartProps {
  subjectUsage: Record<string, number>;
  gradeUsage: Record<string, number>;
  guardrailTrend: { date: string; count: number }[];
}

export default function FeatureUsageChart({
  subjectUsage,
  gradeUsage,
  guardrailTrend,
}: FeatureUsageChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-bold">
        Đang tải biểu đồ...
      </div>
    );
  }

  // Parse subject data
  const subjectData = [
    { name: 'Toán', count: subjectUsage.math || 0, color: '#6C63FF' },
    { name: 'T.Việt', count: subjectUsage.vietnamese || 0, color: '#FF6B9D' },
    { name: 'K.Học', count: subjectUsage.science || 0, color: '#06D6A0' },
    { name: 'T.Anh', count: subjectUsage.english || 0, color: '#3B82F6' },
    { name: 'Đ.Đức', count: subjectUsage.ethics || 0, color: '#F59E0B' },
    { name: 'L.Sử', count: subjectUsage.history || 0, color: '#8B5CF6' },
  ];

  // Parse grade data
  const COLORS = ['#FF6B9D', '#FFD166', '#06D6A0', '#3B82F6', '#6C63FF'];
  const gradeData = Object.entries(gradeUsage).map(([grade, val], i) => ({
    name: `Lớp ${grade}`,
    value: val || 0,
    color: COLORS[i % COLORS.length],
  })).filter(item => item.value > 0);

  // Fallback if gradeData is empty
  const activeGradeData = gradeData.length > 0 ? gradeData : [
    { name: 'Lớp 3', value: 1, color: '#6C63FF' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Subject Usage Bar Chart */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-800 text-sm font-display">Phiên học theo Môn học</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Distribution Pie Chart */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-800 text-sm font-display">Phân bổ theo Lớp</h3>
        </div>
        <div className="h-48 w-full flex items-center justify-between">
          <div className="w-[60%] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeGradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {activeGradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="w-[40%] flex flex-col gap-1.5 pr-2">
            {activeGradeData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[10px] font-bold text-slate-500">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guardrail Block Events Line Chart */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-slate-800 text-sm font-display">Sự kiện Chặn từ nhạy cảm (7 ngày)</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={guardrailTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
