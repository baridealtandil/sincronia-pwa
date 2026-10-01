import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Eye, EyeCheck, Sparkles, 
  User, Plus, FolderPlus, Bell, Check, Clock
} from 'lucide-react';
import { Project, Task, TaskStatus } from '../types';

interface WizardStep4Props {
  project: Project;
  tasks: Task[];
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
        particleCount: 80,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Project Card Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                En Curso
              </span>
            </div>
            <p className="text-xs text-slate-400">Líder: <strong className="text-slate-200">{project.leaderName}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'leader' && (
              <>
                <button
                  onClick={onAddMoreTasksClick}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Tareas</span>
                </button>
                <button
                  onClick={onNewProjectClick}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nuevo Proyecto</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Simple Progress Gauge */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">Progreso del Proyecto ({completedCount}/{totalCount} terminadas)</span>
            <span className="text-indigo-400 font-mono">{percent}%</span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
            <span>👀 {readCount} de {totalCount} lecturas confirmadas</span>
            <span>✅ {completedCount} completadas al 100%</span>
          </div>
        </div>

      </div>

      {/* Filter by Collaborator */}
      {uniqueAssignees.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 flex-shrink-0 font-medium">Filtrar por:</span>
          <button
            onClick={() => setFilterCollaborator('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
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
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isRead = task.status === 'leido' || task.status === 'completado';
          const isCompleted = task.status === 'completado';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                isCompleted
                  ? 'bg-slate-950/60 border-emerald-950/60 text-slate-400'
                  : isRead
                  ? 'bg-slate-900 border-indigo-950/80 shadow-md'
                  : 'bg-slate-900 border-slate-800 shadow-md'
              }`}
            >
              
              {/* Task Header & Assignee */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className={`text-base font-bold tracking-tight ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                    Asignado a: <span className="text-slate-200">{task.assignedTo}</span>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Terminada
                    </span>
                  ) : isRead ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-400" />
                      Leído por {task.readBy}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pendiente de Lectura
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Collaborator / Leader */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                
                {/* Step A: Confirm Reading Button */}
                {!isRead && (
                  <button
                    onClick={() => handleRead(task.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Confirmar Lectura (Leído)</span>
                  </button>
                )}

                {/* Step B: Complete Task 100% Button */}
                {!isCompleted && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tildar 100% Terminada</span>
                  </button>
                )}

                {isCompleted && (
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>¡Tarea finalizada por {task.completedBy}!</span>
                  </div>
                )}

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
