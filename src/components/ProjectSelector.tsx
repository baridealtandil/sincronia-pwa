import React, { useState } from 'react';
import { FolderPlus, Lock, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project, Task, UserRole } from '../types';

interface ProjectSelectorProps {
  projects: Project[];
  allTasks: Task[];
  activeProjectId: string | null;
  unlockedProjects: Record<string, boolean>;
  userRole: UserRole;
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  allTasks,
  activeProjectId,
  unlockedProjects,
  userRole,
  onSelectProject,
  onCreateProject
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [pin, setPin] = useState('1234');
  const [biometricRequired, setBiometricRequired] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      leaderName: leaderName.trim() || 'Jefe de Proyecto',
      pin: pin.length === 4 ? pin : '1234',
      biometricRequired
    });

    setName('');
    setDescription('');
    setLeaderName('');
    setPin('1234');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Proyectos Activos del Equipo
          </h2>
          <p className="text-xs text-slate-400">Selecciona un proyecto para colaborar en tiempo real o crear objetivos</p>
        </div>

        {userRole === 'leader' && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        )}
      </div>

      {/* New Project Modal Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Crear Nuevo Proyecto Protegido</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Proyecto *</label>
              <input
                type="text"
                placeholder="Ej. Rediseño App Móvil 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Breve resumen de las metas de este proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Jefe de Proyecto</label>
              <input
                type="text"
                placeholder="Ej. Ing. Carlos V."
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN de Acceso de 4 Dígitos *</label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="bioReq"
                checked={biometricRequired}
                onChange={(e) => setBiometricRequired(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="bioReq" className="text-xs text-slate-300">
                Permitir desbloqueo con Face ID / Touch ID (Biometría)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              Crear Proyecto
            </button>
          </div>
        </form>
      )}

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          const projTasks = allTasks.filter(t => t.projectId === proj.id);
          const completed = projTasks.filter(t => t.completed).length;
          const total = projTasks.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isUnlocked = unlockedProjects[proj.id];
          const isActive = activeProjectId === proj.id;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {proj.name}
                  </h3>
                  
                  {isUnlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Desbloqueado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      PIN {proj.pin}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{proj.description}</p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                    <span>Avance: {completed}/{total} tareas</span>
                    <span className="font-mono text-indigo-400 font-bold">{percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Líder: <strong className="text-slate-400">{proj.leaderName}</strong></span>
                  <div className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{isActive ? 'Viendo Ahora' : 'Entrar'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
