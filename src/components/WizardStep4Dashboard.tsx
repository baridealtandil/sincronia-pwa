import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Eye, Plus, FolderPlus, 
  Sparkles, Clock, Bell, Check, User
} from 'lucide-react';
import { Project, Task, AppNotification } from '../types';

interface WizardStep4Props {
  project: Project;
  tasks: Task[];
  notifications: AppNotification[];
  userRole: 'leader' | 'collaborator';
  userName: string;
  onConfirmReadTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onNewProjectClick: () => void;
  onAddMoreTasksClick: () => void;
}

export const WizardStep4Dashboard: React.FC<WizardStep4Props> = ({
  project,
  tasks,
  notifications,
  userRole,
  userName,
  onConfirmReadTask,
  onCompleteTask,
  onNewProjectClick,
  onAddMoreTasksClick
}) => {
  const [filterCollaborator, setFilterCollaborator] = useState<string>('all');

  const completedCount = tasks.filter(t => t.status === 'completado').length;
  const readCount = tasks.filter(t => t.status === 'leido' || t.status === 'completado').length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleRead = (taskId: string) => {
    onConfirmReadTask(taskId);
  };

  const handleComplete = (taskId: string) => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#34d399', '#a855f7']
      });
    } catch (e) {
      console.log(e);
    }
    onCompleteTask(taskId);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterCollaborator !== 'all' && t.assignedTo !== filterCollaborator) {
      return false;
    }
    return true;
  });

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));
  const latestNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Latest Notification Toast Banner (If any) */}
      {latestNotification && (
        <div className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-fade-in ${
          latestNotification.type === 'completed'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-base flex-shrink-0">
              {latestNotification.type === 'completed' ? '🎉' : '👀'}
            </div>
            <div>
              <h5 className="font-extrabold text-xs">{latestNotification.title}</h5>
              <p className="text-xs text-slate-200">{latestNotification.message}</p>
            </div>
          </div>
          <span className="text-[10px] opacity-75 font-mono">Reciente</span>
        </div>
      )}

      {/* Main Project Overview Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                En Curso
              </span>
            </div>
            <p className="text-xs text-slate-400">Jefe del Proyecto: <strong className="text-slate-200">{project.leaderName}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'leader' && (
              <>
                <button
                  onClick={onAddMoreTasksClick}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>+ Tareas</span>
                </button>
                <button
                  onClick={onNewProjectClick}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Nuevo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Card Gauge */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span className="text-slate-300">Avance Total ({completedCount}/{totalCount} Tareas 100% Listas)</span>
            <span className="text-indigo-400 font-mono text-sm">{percent}%</span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>👀 {readCount} lecturas confirmadas</span>
            <span>✅ {completedCount} tareas terminadas 100%</span>
          </div>
        </div>

      </div>

      {/* Filter by Assignee */}
      {uniqueAssignees.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 flex-shrink-0 font-bold">Filtrar:</span>
          <button
            onClick={() => setFilterCollaborator('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCollaborator === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>

          {uniqueAssignees.map(name => (
            <button
              key={name}
              onClick={() => setFilterCollaborator(name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterCollaborator === name
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 {name} ({tasks.filter(t => t.assignedTo === name).length})
            </button>
          ))}
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">No hay tareas en este proyecto aún.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isRead = task.status === 'leido' || task.status === 'completado';
            const isCompleted = task.status === 'completado';

            return (
              <div
                key={task.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
                  isCompleted
                    ? 'bg-slate-950/60 border-emerald-950/60 text-slate-400'
                    : isRead
                    ? 'bg-slate-900 border-indigo-950/80 shadow-indigo-950/20'
                    : 'bg-slate-900 border-slate-800 shadow-slate-950/40'
                }`}
              >
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`text-base font-extrabold tracking-tight ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-indigo-400 font-bold mt-1">
                      Asignado a: <span className="text-slate-200">{task.assignedTo}</span>
                    </p>
                  </div>

                  {/* Status Card Badge */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        100% Terminada
                      </span>
                    ) : isRead ? (
                      <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        Leído por {task.readBy}
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Sin Leer
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
                  
                  {/* Action 1: Confirm Reading */}
                  {!isRead && (
                    <button
                      onClick={() => handleRead(task.id)}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span>Confirmar Lectura (Leído)</span>
                    </button>
                  )}

                  {/* Action 2: Complete 100% */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tildar 100% Terminada</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Trabajo finalizado 100% por {task.completedBy}!</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
