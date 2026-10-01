import React, { useState } from 'react';
import { FolderPlus, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface WizardStep1Props {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (name: string, leaderName: string) => void;
  onNextStep: () => void;
}

export const WizardStep1Project: React.FC<WizardStep1Props> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onNextStep
}) => {
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject(name.trim(), leaderName.trim() || 'Líder del Proyecto');
    setName('');
    setLeaderName('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      
      {/* Card Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Paso 1 de 3: Proyecto
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">¿Cuál es el nuevo proyecto?</h2>
        <p className="text-xs text-slate-400">Escribe el nombre del proyecto y quién será el líder a cargo.</p>
      </div>

      {/* New Project Card Form */}
      <form onSubmit={handleCreate} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Nombre del Proyecto *</label>
          <input
            type="text"
            placeholder="Ej. Lanzamiento de Marca 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Nombre del Líder del Proyecto</label>
          <input
            type="text"
            placeholder="Ej. Ing. Carlos Pérez"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Crear Proyecto y Continuar</span>
        </button>

      </form>

      {/* Existing Projects Quick Switch */}
      {projects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">O selecciona un proyecto existente:</h4>
          
          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-sm text-white">{p.name}</h5>
                    <p className="text-[11px] text-slate-400">Líder: {p.leaderName}</p>
                  </div>

                  {isSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNextStep();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-indigo-500"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Seleccionar</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
