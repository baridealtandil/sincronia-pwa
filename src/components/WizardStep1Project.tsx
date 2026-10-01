import React, { useState } from 'react';
import { FolderPlus, ArrowRight, Folder, Trash2, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface WizardStep1Props {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (name: string, leaderName: string) => void;
  onDeleteProject: (projId: string) => void;
  onNextStep: () => void;
}

export const WizardStep1Project: React.FC<WizardStep1Props> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onNextStep
}) => {
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject(name.trim(), leaderName.trim() || 'Líder de Proyecto');
    setName('');
    setLeaderName('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      
      {/* Card Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20">
          Tarjeta 1: Crear Proyecto
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Nuevo Proyecto</h2>
        <p className="text-xs text-slate-400">Ingresa los datos principales del proyecto para comenzar desde cero.</p>
      </div>

      {/* Main Card */}
      <form onSubmit={handleCreate} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">Nombre del Proyecto *</label>
          <input
            type="text"
            placeholder="Ej. Campaña de Marketing Q4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">Nombre del Jefe / Líder del Proyecto</label>
          <input
            type="text"
            placeholder="Ej. Ing. Carlos Pérez"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <FolderPlus className="w-5 h-5" />
          <span>Crear Proyecto y Continuar</span>
        </button>

      </form>

      {/* Existing Projects Cards list */}
      {projects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tus Proyectos Guardados:</h4>
          
          <div className="space-y-2.5">
            {projects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-white">{p.name}</h5>
                      <p className="text-[11px] text-slate-400">Líder: {p.leaderName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(p.id);
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isSelected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNextStep();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-indigo-500 shadow-md"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Seleccionar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
