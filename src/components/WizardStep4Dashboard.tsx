import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Eye, Plus, FolderPlus, Clock, 
  AlertCircle, Users, Sparkles, UserCheck, Search, Filter, Shield
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
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'completed'>('all');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completado');
  const readTasks = tasks.filter(t => t.status === 'leido' || t.status === 'completado');
  const unreadTasks = tasks.filter(t => t.status === 'pendiente');

  const completedCount = completedTasks.length;
  const readCount = readTasks.length;
  const unreadCount = unreadTasks.length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));

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
    if (filterPerson !== 'all' && t.assignedTo !== filterPerson) return false;
    if (filterStatus === 'unread') return t.status === 'pendiente';
    if (filterStatus === 'read') return t.status === 'leido';
    if (filterStatus === 'completed') return t.status === 'completado';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* 📊 TARJETA DE AVANCE GLOBAL DEL PROYECTO */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Avance en Vivo
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
                  <span>+ Agregar Tareas</span>
                </button>
                <button
                  onClick={onNewProjectClick}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Nuevo Proyecto</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Progress Meter */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span className="text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Porcentaje Global Completado
            </span>
            <span className="text-indigo-400 font-mono text-base">{percent}%</span>
          </div>

          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 3 Status KPI Cards (Quien leyó, Quien NO leyó, Quien terminó) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Card 1: Pendientes de Lectura */}
          <div 
            onClick={() => setFilterStatus(filterStatus === 'unread' ? 'all' : 'unread')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              filterStatus === 'unread'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Sin Leer
              </span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{unreadCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Tareas que nadie ha abierto aún</p>
          </div>

          {/* Card 2: Leídos */}
          <div 
            onClick={() => setFilterStatus(filterStatus === 'read' ? 'all' : 'read')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              filterStatus === 'read'
                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-indigo-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Lectura Confirmada
              </span>
              <span className="text-lg font-extrabold text-indigo-300 font-mono">{readCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Confirmaron que leyeron las órdenes</p>
          </div>

          {/* Card 3: Completados 100% */}
          <div 
            onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Terminadas
              </span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">{completedCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Tildadas como finalizadas</p>
          </div>

        </div>

      </div>

      {/* 👤 FILTRAR AVANCE POR PERSONA / COLABORADOR */}
      {uniqueAssignees.length > 0 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Ver Avance Específico por Colaborador:
            </span>
            {filterPerson !== 'all' && (
              <button
                onClick={() => setFilterPerson('all')}
                className="text-[11px] text-indigo-400 hover:underline font-semibold"
              >
                Ver Todos
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterPerson('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPerson === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos los Integrantes ({totalTasks})
            </button>

            {uniqueAssignees.map(name => {
              const personTasks = tasks.filter(t => t.assignedTo === name);
              const personCompleted = personTasks.filter(t => t.status === 'completado').length;
              return (
                <button
                  key={name}
                  onClick={() => setFilterPerson(name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterPerson === name
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  👤 {name} ({personCompleted}/{personTasks.length} listas)
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎴 LISTADO DE TARJETAS DE TAREA DETALLADAS */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">No hay tareas que coincidan con este filtro.</p>
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

                  {/* Estado Visual de la Tarjeta */}
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

                {/* Audit Details (Quien leyó y cuando, quien termino) */}
                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-400" />
                      Estado de Lectura:
                    </span>
                    {task.readBy ? (
                      <span className="text-indigo-300 font-bold"> Confirmado por {task.readBy}</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">⚪ Aún no ha confirmado lectura</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Estado de Trabajo:
                    </span>
                    {task.completedBy ? (
                      <span className="text-emerald-400 font-bold"> 100% Completado por {task.completedBy}</span>
                    ) : (
                      <span className="text-slate-500 font-medium">En proceso de ejecución</span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  
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
                      <span>¡Trabajo finalizado al 100%!</span>
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
