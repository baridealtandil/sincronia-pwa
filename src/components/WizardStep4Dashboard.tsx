import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Eye, Plus, FolderPlus, Clock, 
  Users, Sparkles, UserCheck, RefreshCw, ArrowRightLeft, UserX, AlertCircle
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
  onReassignTask: (taskId: string, newAssignee: string) => void;
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
  onReassignTask,
  onNewProjectClick,
  onAddMoreTasksClick
}) => {
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'completed'>('all');

  // Reassignment Modal/Dropdown State
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState<string>('');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completado');
  const readTasks = tasks.filter(t => t.status === 'leido' || t.status === 'completado');
  const unreadTasks = tasks.filter(t => t.status === 'pendiente');

  const completedCount = completedTasks.length;
  const readCount = readTasks.length;
  const unreadCount = unreadTasks.length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));
  const defaultTeamList = Array.from(new Set([...uniqueAssignees, 'Sofía', 'Mateo', 'Lucas', 'Valentina']));

  const handleRead = (taskId: string) => {
    onConfirmReadTask(taskId);
  };

  const handleComplete = (taskId: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#a855f7']
      });
    } catch (e) {
      console.log(e);
    }
    onCompleteTask(taskId);
  };

  const handleConfirmReassign = (taskId: string) => {
    if (selectedNewAssignee && selectedNewAssignee.trim()) {
      onReassignTask(taskId, selectedNewAssignee.trim());
      setReassigningTaskId(null);
      setSelectedNewAssignee('');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPerson !== 'all' && t.assignedTo !== filterPerson) return false;
    if (filterStatus === 'unread') return t.status === 'pendiente';
    if (filterStatus === 'read') return t.status === 'leido';
    if (filterStatus === 'completed') return t.status === 'completado';
    return true;
  });

  const latestNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* 🔔 Latest Activity Banner */}
      {latestNotification && (
        <div className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-fade-in ${
          latestNotification.type === 'completed'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : latestNotification.type === 'reassigned'
            ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
            : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-base flex-shrink-0">
              {latestNotification.type === 'completed' ? '🎉' : latestNotification.type === 'reassigned' ? '🔄' : '👀'}
            </div>
            <div>
              <h5 className="font-extrabold text-xs">{latestNotification.title}</h5>
              <p className="text-xs text-slate-200">{latestNotification.message}</p>
            </div>
          </div>
          <span className="text-[10px] opacity-75 font-mono">En vivo</span>
        </div>
      )}

      {/* 📊 EXECUTIVE PROJECT CARD */}
      <div className="rounded-3xl bg-slate-900/90 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl shadow-slate-950/80 space-y-6 backdrop-blur-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Tablero Synchro
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
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>+ Tareas</span>
                </button>
                <button
                  onClick={onNewProjectClick}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Nuevo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Progress Meter */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span className="text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Avance Global del Proyecto
            </span>
            <span className="text-cyan-400 font-mono text-base">{percent}%</span>
          </div>

          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
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
            <p className="text-[10px] text-slate-400">Pendientes de confirmación</p>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'read' ? 'all' : 'read')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              filterStatus === 'read'
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg ring-1 ring-cyan-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Leídos
              </span>
              <span className="text-lg font-extrabold text-cyan-300 font-mono">{readCount}</span>
            </div>
            <p className="text-[10px] text-slate-400">Lectura confirmada</p>
          </div>

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
            <p className="text-[10px] text-slate-400">Trabajo finalizado</p>
          </div>

        </div>

      </div>

      {/* Filter by Person */}
      {uniqueAssignees.length > 0 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Ver Avance Específico por Integrante:
            </span>
            {filterPerson !== 'all' && (
              <button
                onClick={() => setFilterPerson('all')}
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
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
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({totalTasks})
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
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  👤 {name} ({personCompleted}/{personTasks.length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK CARDS GRID */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">No hay tareas en este filtro.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isRead = task.status === 'leido' || task.status === 'completado';
            const isCompleted = task.status === 'completado';
            const isReassigningThis = reassigningTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
                  isCompleted
                    ? 'bg-slate-950/70 border-emerald-950/60 text-slate-400'
                    : isRead
                    ? 'bg-slate-900/90 border-cyan-950/80 shadow-cyan-950/20'
                    : 'bg-slate-900/90 border-slate-800 shadow-slate-950/40'
                }`}
              >
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`text-base font-extrabold tracking-tight ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-cyan-400 font-bold">
                        Asignado a: <span className="text-slate-100">{task.assignedTo}</span>
                      </p>

                      {task.reassignedFrom && (
                        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          🔄 Reasignada de {task.reassignedFrom}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        100% Terminada
                      </span>
                    ) : isRead ? (
                      <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
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

                {/* Audit Details */}
                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Estado de Lectura:
                    </span>
                    {task.readBy ? (
                      <span className="text-cyan-300 font-bold"> Confirmado por {task.readBy}</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">⚪ Pendiente de confirmación</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Estado de Trabajo:
                    </span>
                    {task.completedBy ? (
                      <span className="text-emerald-400 font-bold"> 100% Completado por {task.completedBy}</span>
                    ) : (
                      <span className="text-slate-500 font-medium">En ejecucion</span>
                    )}
                  </div>
                </div>

                {/* Inline Task Reassignment Selector Form */}
                {isReassigningThis && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                        Reasignar esta tarea a otro colaborador:
                      </span>
                      <button
                        onClick={() => setReassigningTaskId(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={selectedNewAssignee}
                        onChange={(e) => setSelectedNewAssignee(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold outline-none focus:border-cyan-500"
                      >
                        <option value="">Selecciona nuevo responsable...</option>
                        {defaultTeamList.filter(name => name !== task.assignedTo).map(name => (
                          <option key={name} value={name}>
                            👤 {name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleConfirmReassign(task.id)}
                        disabled={!selectedNewAssignee}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md"
                      >
                        Confirmar Reasignación
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
                  
                  {/* Reassign Button */}
                  {!isCompleted && !isReassigningThis && (
                    <button
                      onClick={() => {
                        setReassigningTaskId(task.id);
                        setSelectedNewAssignee('');
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="Reasignar esta tarea a otra persona del equipo"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>🔄 Reasignar</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2.5 ml-auto">
                    {/* Action 1: Confirm Reading */}
                    {!isRead && (
                      <button
                        onClick={() => handleRead(task.id)}
                        className="px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Confirmar Lectura (Leído)</span>
                      </button>
                    )}

                    {/* Action 2: Complete 100% */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
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

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
