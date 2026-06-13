// components/exercises/LabelDiagramExercise.tsx
'use client';

import React, { useState } from 'react';
import { LabelDiagramExercise as DataType } from '@/lib/exerciseTypes';
import { ExerciseCard } from './ExerciseCard';
import { DIAGRAM_LIBRARY } from './diagrams/DIAGRAM_LIBRARY';

interface Props {
  data: DataType;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
}

export function LabelDiagramExercise({ data, onAnswer }: Props) {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  // Maps hotspot id -> assigned label string
  const [assignedLabels, setAssignedLabels] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Get SVG diagram component from library
  const DiagramComponent = DIAGRAM_LIBRARY[data.diagramId];

  const handleSelectHotspot = (id: string) => {
    if (submitted) return;
    
    // If already labeled, clear the label
    if (assignedLabels[id]) {
      const newLabels = { ...assignedLabels };
      delete newLabels[id];
      setAssignedLabels(newLabels);
      setSelectedHotspot(null);
    } else {
      setSelectedHotspot(id);
    }
  };

  const handleSelectLabel = (label: string) => {
    if (submitted || selectedHotspot === null) return;

    setAssignedLabels((prev) => ({
      ...prev,
      [selectedHotspot]: label,
    }));
    setSelectedHotspot(null);
  };

  const handleSubmit = () => {
    if (Object.keys(assignedLabels).length !== data.hotspots.length || submitted) return;

    // Check correctness of every hotspot
    const isCorrect = data.hotspots.every((hs) => {
      const label = assignedLabels[hs.id];
      return label === hs.correctLabel;
    });

    setSubmitted(true);
    setTimeout(() => {
      onAnswer(assignedLabels, isCorrect);
    }, 500);
  };

  if (!DiagramComponent) {
    return (
      <ExerciseCard emoji="⚠️" title="Lỗi tải sơ đồ">
        <p className="text-center font-bold text-xs text-rose-500">
          Không tìm thấy sơ đồ với ID: {data.diagramId}
        </p>
      </ExerciseCard>
    );
  }

  // Find currently selected hotspot name for instructions
  const activeHotspotIndex = data.hotspots.findIndex((h) => h.id === selectedHotspot);
  const activeHotspotNumber = activeHotspotIndex !== -1 ? activeHotspotIndex + 1 : null;

  return (
    <ExerciseCard emoji="🔬" title="Gắn nhãn sơ đồ">
      <div className="flex flex-col gap-3 items-center">
        <p className="font-display font-black text-slate-800 text-sm leading-relaxed text-center">
          {data.instruction}
        </p>

        {/* Diagram SVG Component */}
        <DiagramComponent
          selectedHotspot={selectedHotspot}
          onSelectHotspot={handleSelectHotspot}
          assignedLabels={assignedLabels}
        />

        {/* Label options */}
        <div className="w-full flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase text-center select-none">
            {selectedHotspot !== null
              ? `👉 Chọn nhãn cho vị trí số ${activeHotspotNumber}`
              : '👇 Chạm vào 1 vị trí (số) trên sơ đồ để gắn nhãn'}
          </p>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.labelOptions.map((label, idx) => {
              const isAssigned = Object.values(assignedLabels).includes(label);
              return (
                <button
                  key={idx}
                  disabled={submitted || selectedHotspot === null}
                  onClick={() => handleSelectLabel(label)}
                  className={`px-3 py-1.5 border-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 shadow-sm ${
                    isAssigned
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                      : selectedHotspot !== null
                      ? 'bg-white hover:bg-slate-50 border-purple-200 text-purple-700'
                      : 'bg-slate-50 border-slate-100 text-slate-450 cursor-not-allowed'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={Object.keys(assignedLabels).length !== data.hotspots.length || submitted}
          onClick={handleSubmit}
          className="w-full py-2.5 mt-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-display font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          ✓ Hoàn thành sơ đồ
        </button>
      </div>
    </ExerciseCard>
  );
}
