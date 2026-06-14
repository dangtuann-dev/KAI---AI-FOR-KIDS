'use client';

import React from 'react';
import { DIAGRAM_LIBRARY } from '@/components/exercises/diagrams/DIAGRAM_LIBRARY';

interface Data {
  type: 'diagram_static';
  diagramId: string;
  label?: string;
}

const PRESET_LABELS: Record<string, Record<string, string>> = {
  plant_parts: {
    flower: 'Hoa',
    leaf: 'Lá',
    fruit: 'Quả',
    stem: 'Thân',
    root: 'Rễ'
  },
  water_cycle: {
    evaporation: 'Bốc hơi',
    condensation: 'Ngưng tụ',
    precipitation: 'Mưa',
    runoff: 'Dòng chảy'
  },
  digestive_system: {
    mouth: 'Miệng',
    stomach: 'Dạ dày',
    intestines: 'Ruột'
  }
};

export function DiagramStatic({ data }: { data: Data }) {
  const DiagramComponent = DIAGRAM_LIBRARY[data.diagramId];
  const assignedLabels = PRESET_LABELS[data.diagramId] || {};

  if (!DiagramComponent) {
    return (
      <div className="w-full max-w-sm mx-auto p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl text-center">
        <p className="text-sm font-black text-rose-600 font-display">
          Không tìm thấy sơ đồ với ID: {data.diagramId} ⚠️
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-lg flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-300">
      {data.label && (
        <h4 className="font-display font-black text-slate-800 text-sm mb-4 text-center uppercase tracking-wide">
          🔬 {data.label}
        </h4>
      )}
      
      <div className="w-full flex justify-center bg-slate-950/5 rounded-2xl p-4 border border-slate-100">
        <DiagramComponent
          selectedHotspot={null}
          onSelectHotspot={() => {}}
          assignedLabels={assignedLabels}
        />
      </div>
    </div>
  );
}
