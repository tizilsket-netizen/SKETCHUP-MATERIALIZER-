
import React from 'react';
import { LightingPreset } from '../types';
import { Sliders, Zap, Sun, Palette, Info } from 'lucide-react';

interface FactorizationPanelProps {
  consistency: number;
  setConsistency: (val: number) => void;
  lighting: LightingPreset;
  setLighting: (val: LightingPreset) => void;
  styleRef: string | null;
  setStyleRef: (val: string | null) => void;
}

const FactorizationPanel: React.FC<FactorizationPanelProps> = ({
  consistency,
  setConsistency,
  lighting,
  setLighting,
  styleRef,
  setStyleRef
}) => {
  const handleStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setStyleRef(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col p-6 gap-8 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="text-yellow-500 w-5 h-5" />
        <h2 className="text-lg font-semibold tracking-tight">Factorization</h2>
      </div>

      {/* Material Consistency */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Consistency
          </label>
          <span className="text-xs font-mono text-zinc-500">{(consistency * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={consistency}
          onChange={(e) => setConsistency(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
        />
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Determines how much of the original sketch's structural "DNA" is preserved in the final render.
        </p>
      </section>

      {/* Lighting Presets */}
      <section className="space-y-4">
        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Sun className="w-4 h-4" /> Lighting Environment
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(LightingPreset).map((preset) => (
            <button
              key={preset}
              onClick={() => setLighting(preset)}
              className={`text-left px-3 py-2.5 rounded-md text-xs transition-all border ${
                lighting === preset
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {/* Style DNA */}
      <section className="space-y-4">
        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Style Reference (DNA)
        </label>
        <div className="relative aspect-video rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center gap-2 overflow-hidden hover:bg-zinc-900 transition-colors">
          {styleRef ? (
            <>
              <img src={styleRef} alt="Reference" className="w-full h-full object-cover" />
              <button 
                onClick={() => setStyleRef(null)}
                className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white text-[10px]"
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <Palette className="w-8 h-8 text-zinc-700" />
              <span className="text-[11px] text-zinc-600">Extract visual style</span>
              <input 
                type="file" 
                onChange={handleStyleUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
              />
            </>
          )}
        </div>
      </section>

      <div className="mt-auto pt-8 border-t border-zinc-900">
        <div className="flex items-start gap-2 bg-zinc-900/50 p-3 rounded-lg">
          <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-normal">
            Jan 2026 Build. Using Gemini 3.0 Pro & Imagen 4.0 for state-of-the-art architectural precision.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FactorizationPanel;
